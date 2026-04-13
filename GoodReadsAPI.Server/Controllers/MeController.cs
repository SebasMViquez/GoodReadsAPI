using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Contracts;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GoodReadsAPI.Server.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
public sealed class MeController(
    ISocialGraphService socialGraphService,
    IUserLibraryService userLibraryService,
    IUserService userService)
    : ControllerBase
{
    [HttpPut("profile")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> UpdateProfile(
        [FromBody] UpdateMyProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide a valid authenticated user.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        try
        {
            var updated = await userService.UpdateProfileAsync(
                currentUserId,
                request.Locale,
                request.Name,
                request.Username,
                request.Email,
                request.Avatar,
                request.Banner,
                request.Role,
                request.Bio,
                request.Location,
                request.Website,
                request.ProfileVisibility,
                cancellationToken);

            if (updated is null)
            {
                return NotFound();
            }

            return Ok(UserResponse.FromDomain(updated));
        }
        catch (ArgumentException ex)
        {
            return Problem(
                title: "Invalid profile payload",
                detail: ex.Message,
                statusCode: StatusCodes.Status400BadRequest);
        }
        catch (InvalidOperationException ex)
        {
            return Problem(
                title: "Profile update conflict",
                detail: ex.Message,
                statusCode: StatusCodes.Status409Conflict);
        }
        catch (SupabaseRequestException ex)
        {
            var statusCode = ex.StatusCode switch
            {
                System.Net.HttpStatusCode.Conflict => StatusCodes.Status409Conflict,
                System.Net.HttpStatusCode.NotFound => StatusCodes.Status404NotFound,
                System.Net.HttpStatusCode.Unauthorized => StatusCodes.Status401Unauthorized,
                System.Net.HttpStatusCode.Forbidden => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status400BadRequest,
            };

            return Problem(
                title: "Profile update backend error",
                detail: BuildSupabaseDetail(ex),
                statusCode: statusCode);
        }
    }

    [HttpGet("follow-requests")]
    [ProducesResponseType(typeof(IReadOnlyCollection<FollowRequestResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<FollowRequestResponse>>> GetFollowRequests(
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var requests = await socialGraphService.GetPendingFollowRequestsAsync(currentUserId, cancellationToken);
        return Ok(requests.Select(FollowRequestResponse.FromDomain).ToArray());
    }

    [HttpPost("follow-requests/{requestId}/accept")]
    [ProducesResponseType(typeof(FollowRequestResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowRequestResponse>> AcceptFollowRequest(
        string requestId,
        CancellationToken cancellationToken)
    {
        return await RespondToFollowRequest(requestId, "accepted", cancellationToken);
    }

    [HttpPost("follow-requests/{requestId}/decline")]
    [ProducesResponseType(typeof(FollowRequestResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<FollowRequestResponse>> DeclineFollowRequest(
        string requestId,
        CancellationToken cancellationToken)
    {
        return await RespondToFollowRequest(requestId, "declined", cancellationToken);
    }

    [HttpGet("library")]
    [ProducesResponseType(typeof(UserLibraryStateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserLibraryStateResponse>> GetLibrary(CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var entries = await userLibraryService.GetLibraryAsync(currentUserId, cancellationToken);
        return Ok(UserLibraryStateResponse.FromEntries(entries));
    }

    [HttpPut("library/books/{bookId}/shelf")]
    [ProducesResponseType(typeof(LibraryEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LibraryEntryResponse>> SetShelf(
        string bookId,
        [FromBody] SetShelfRequest request,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        try
        {
            var updated = await userLibraryService.SetShelfAsync(
                currentUserId,
                bookId,
                request.ShelfStatus,
                cancellationToken);

            return Ok(LibraryEntryResponse.FromDomain(updated));
        }
        catch (ArgumentException ex)
        {
            return Problem(
                title: "Invalid shelf status",
                detail: ex.Message,
                statusCode: StatusCodes.Status400BadRequest);
        }
    }

    [HttpPut("library/books/{bookId}/favorite")]
    [ProducesResponseType(typeof(LibraryEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SetFavorite(
        string bookId,
        [FromBody] SetFavoriteRequest request,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var updated = await userLibraryService.SetFavoriteAsync(
            currentUserId,
            bookId,
            request.IsFavorite,
            cancellationToken);

        if (updated is null)
        {
            return NoContent();
        }

        return Ok(LibraryEntryResponse.FromDomain(updated));
    }

    [HttpPut("library/books/{bookId}/progress")]
    [ProducesResponseType(typeof(LibraryEntryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LibraryEntryResponse>> UpdateProgress(
        string bookId,
        [FromBody] UpdateProgressRequest request,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var updated = await userLibraryService.UpdateProgressAsync(
            currentUserId,
            bookId,
            request.Progress,
            cancellationToken);

        return Ok(LibraryEntryResponse.FromDomain(updated));
    }

    [HttpGet("library/favorites/following")]
    [ProducesResponseType(typeof(IReadOnlyCollection<FollowingFavoritesResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<IReadOnlyCollection<FollowingFavoritesResponse>>> GetFollowingFavoriteBooks(
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var favorites = await userLibraryService.GetFollowingFavoriteBooksAsync(
            currentUserId,
            cancellationToken);

        return Ok(favorites.Select(FollowingFavoritesResponse.FromDomain).ToArray());
    }

    private async Task<ActionResult<FollowRequestResponse>> RespondToFollowRequest(
        string requestId,
        string status,
        CancellationToken cancellationToken)
    {
        if (!this.TryResolveCurrentUserId(out var currentUserId))
        {
            return Problem(
                title: "Missing current user context",
                detail: "Provide header X-User-Id or query parameter userId.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        var updated = await socialGraphService.RespondToFollowRequestAsync(
            currentUserId,
            requestId,
            status,
            cancellationToken);

        if (updated is null)
        {
            return NotFound();
        }

        return Ok(FollowRequestResponse.FromDomain(updated));
    }

    private static string BuildSupabaseDetail(SupabaseRequestException exception)
    {
        if (string.IsNullOrWhiteSpace(exception.Details))
        {
            return exception.Message;
        }

        var compact = exception.Details.Trim().ReplaceLineEndings(" ");
        return compact.Length > 600 ? compact[..600] : compact;
    }
}
