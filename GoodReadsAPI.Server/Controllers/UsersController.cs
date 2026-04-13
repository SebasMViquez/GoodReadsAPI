using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Contracts;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoodReadsAPI.Server.Controllers;

[ApiController]
[Route("api/users")]
public sealed class UsersController(
    IUserService userService,
    ISocialGraphService socialGraphService,
    IUserLibraryService userLibraryService)
    : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyCollection<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<UserResponse>>> Search(
        [FromQuery] string? query,
        [FromQuery] string? visibility,
        CancellationToken cancellationToken)
    {
        var users = await userService.SearchAsync(query, visibility, cancellationToken);
        return Ok(users.Select(UserResponse.FromDomain).ToArray());
    }

    [HttpGet("{username}")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> GetByUsername(
        string username,
        CancellationToken cancellationToken)
    {
        var user = await userService.GetByUsernameAsync(username, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        return Ok(UserResponse.FromDomain(user));
    }

    [HttpGet("{userId}/followers")]
    [ProducesResponseType(typeof(IReadOnlyCollection<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<UserResponse>>> GetFollowers(
        string userId,
        CancellationToken cancellationToken)
    {
        var followers = await socialGraphService.GetFollowersAsync(userId, cancellationToken);
        return Ok(followers.Select(UserResponse.FromDomain).ToArray());
    }

    [HttpGet("{userId}/following")]
    [ProducesResponseType(typeof(IReadOnlyCollection<UserResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyCollection<UserResponse>>> GetFollowing(
        string userId,
        CancellationToken cancellationToken)
    {
        var following = await socialGraphService.GetFollowingAsync(userId, cancellationToken);
        return Ok(following.Select(UserResponse.FromDomain).ToArray());
    }

    [HttpGet("{userId}/library")]
    [ProducesResponseType(typeof(UserLibraryStateResponse), StatusCodes.Status200OK)]
    public async Task<ActionResult<UserLibraryStateResponse>> GetLibrary(
        string userId,
        CancellationToken cancellationToken)
    {
        var entries = await userLibraryService.GetLibraryAsync(userId, cancellationToken);
        return Ok(UserLibraryStateResponse.FromEntries(entries));
    }

    [HttpPost("{targetUserId}/follow")]
    [Authorize]
    [ProducesResponseType(typeof(FollowOperationResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowOperationResponse>> Follow(
        string targetUserId,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        FollowOperationResult result;
        try
        {
            result = await socialGraphService.FollowAsync(currentUserId, targetUserId, cancellationToken);
        }
        catch (SupabaseRequestException ex)
        {
            return Problem(
                title: "Follow request failed",
                detail: ex.Details ?? ex.Message,
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (result.Outcome is FollowOperationOutcomes.CurrentUserNotFound or FollowOperationOutcomes.TargetUserNotFound)
        {
            return NotFound();
        }

        if (result.Outcome == FollowOperationOutcomes.CannotFollowSelf)
        {
            return Problem(
                title: "Invalid follow operation",
                detail: "A user cannot follow itself.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        return Ok(FollowOperationResponse.FromDomain(result));
    }

    [HttpDelete("{targetUserId}/follow")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Unfollow(
        string targetUserId,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (string.Equals(currentUserId, targetUserId, StringComparison.Ordinal))
        {
            return Problem(
                title: "Invalid unfollow operation",
                detail: "A user cannot unfollow itself.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        bool deleted;
        try
        {
            deleted = await socialGraphService.UnfollowAsync(currentUserId, targetUserId, cancellationToken);
        }
        catch (SupabaseRequestException ex)
        {
            return Problem(
                title: "Unfollow request failed",
                detail: ex.Details ?? ex.Message,
                statusCode: StatusCodes.Status400BadRequest);
        }

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
