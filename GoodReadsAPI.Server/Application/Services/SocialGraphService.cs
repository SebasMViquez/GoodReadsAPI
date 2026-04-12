using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Repositories;

namespace GoodReadsAPI.Server.Application.Services;

public sealed class SocialGraphService(
    IUserRepository userRepository,
    IUserRelationshipRepository relationshipRepository)
    : ISocialGraphService
{
    public async Task<IReadOnlyCollection<User>> GetFollowersAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var followRows = await relationshipRepository.GetFollowersAsync(userId, cancellationToken);
        var followerIds = followRows
            .Select(row => row.FollowerId)
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (followerIds.Length == 0)
        {
            return [];
        }

        var users = await userRepository.GetByIdsAsync(followerIds, cancellationToken);
        var usersById = users.ToDictionary(user => user.Id, StringComparer.Ordinal);

        return followRows
            .Select(row => usersById.GetValueOrDefault(row.FollowerId))
            .Where(user => user is not null)
            .Cast<User>()
            .ToArray();
    }

    public async Task<IReadOnlyCollection<User>> GetFollowingAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var followRows = await relationshipRepository.GetFollowingAsync(userId, cancellationToken);
        var followedIds = followRows
            .Select(row => row.FollowedId)
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (followedIds.Length == 0)
        {
            return [];
        }

        var users = await userRepository.GetByIdsAsync(followedIds, cancellationToken);
        var usersById = users.ToDictionary(user => user.Id, StringComparer.Ordinal);

        return followRows
            .Select(row => usersById.GetValueOrDefault(row.FollowedId))
            .Where(user => user is not null)
            .Cast<User>()
            .ToArray();
    }

    public async Task<FollowOperationResult> FollowAsync(
        string currentUserId,
        string targetUserId,
        CancellationToken cancellationToken)
    {
        if (string.Equals(currentUserId, targetUserId, StringComparison.Ordinal))
        {
            return new(FollowOperationOutcomes.CannotFollowSelf);
        }

        var currentUser = await userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (currentUser is null)
        {
            return new(FollowOperationOutcomes.CurrentUserNotFound);
        }

        var targetUser = await userRepository.GetByIdAsync(targetUserId, cancellationToken);
        if (targetUser is null)
        {
            return new(FollowOperationOutcomes.TargetUserNotFound);
        }

        var alreadyFollowing = await relationshipRepository.ExistsFollowAsync(
            currentUserId,
            targetUserId,
            cancellationToken);

        if (alreadyFollowing)
        {
            return new(FollowOperationOutcomes.AlreadyFollowing);
        }

        if (string.Equals(targetUser.ProfileVisibility, "private", StringComparison.OrdinalIgnoreCase))
        {
            var pending = await relationshipRepository.GetPendingFollowRequestAsync(
                currentUserId,
                targetUserId,
                cancellationToken);

            if (pending is not null)
            {
                return new(
                    FollowOperationOutcomes.RequestAlreadyPending,
                    pending);
            }

            var followRequest = await relationshipRepository.CreateFollowRequestAsync(
                new FollowRequest(
                    Id: $"request-{Guid.NewGuid():N}"[..16],
                    RequesterId: currentUserId,
                    TargetUserId: targetUserId,
                    Status: "pending",
                    CreatedAt: DateTimeOffset.UtcNow,
                    RespondedAt: null),
                cancellationToken);

            return new(FollowOperationOutcomes.Requested, followRequest);
        }

        await relationshipRepository.CreateFollowAsync(
            new UserFollow(
                FollowerId: currentUserId,
                FollowedId: targetUserId,
                CreatedAt: DateTimeOffset.UtcNow),
            cancellationToken);

        await userRepository.IncrementFollowingCountAsync(currentUserId, 1, cancellationToken);
        await userRepository.IncrementFollowersCountAsync(targetUserId, 1, cancellationToken);

        return new(FollowOperationOutcomes.Followed);
    }

    public async Task<bool> UnfollowAsync(
        string currentUserId,
        string targetUserId,
        CancellationToken cancellationToken)
    {
        if (string.Equals(currentUserId, targetUserId, StringComparison.Ordinal))
        {
            return false;
        }

        var deleted = await relationshipRepository.DeleteFollowAsync(
            currentUserId,
            targetUserId,
            cancellationToken);

        if (!deleted)
        {
            return false;
        }

        await userRepository.IncrementFollowingCountAsync(currentUserId, -1, cancellationToken);
        await userRepository.IncrementFollowersCountAsync(targetUserId, -1, cancellationToken);

        return true;
    }

    public Task<IReadOnlyCollection<FollowRequest>> GetPendingFollowRequestsAsync(
        string currentUserId,
        CancellationToken cancellationToken) =>
        relationshipRepository.GetFollowRequestsForTargetAsync(currentUserId, "pending", cancellationToken);

    public async Task<FollowRequest?> RespondToFollowRequestAsync(
        string currentUserId,
        string requestId,
        string status,
        CancellationToken cancellationToken)
    {
        if (!string.Equals(status, "accepted", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(status, "declined", StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Status must be accepted or declined.", nameof(status));
        }

        var request = await relationshipRepository.GetFollowRequestByIdAsync(requestId, cancellationToken);
        if (request is null ||
            !string.Equals(request.TargetUserId, currentUserId, StringComparison.Ordinal) ||
            !string.Equals(request.Status, "pending", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var normalizedStatus = status.ToLowerInvariant();
        var updated = await relationshipRepository.UpdateFollowRequestStatusAsync(
            requestId,
            normalizedStatus,
            DateTimeOffset.UtcNow,
            cancellationToken);

        if (updated is null)
        {
            return null;
        }

        if (string.Equals(normalizedStatus, "accepted", StringComparison.Ordinal))
        {
            var alreadyFollowing = await relationshipRepository.ExistsFollowAsync(
                request.RequesterId,
                currentUserId,
                cancellationToken);

            if (!alreadyFollowing)
            {
                await relationshipRepository.CreateFollowAsync(
                    new UserFollow(
                        FollowerId: request.RequesterId,
                        FollowedId: currentUserId,
                        CreatedAt: DateTimeOffset.UtcNow),
                    cancellationToken);

                await userRepository.IncrementFollowingCountAsync(request.RequesterId, 1, cancellationToken);
                await userRepository.IncrementFollowersCountAsync(currentUserId, 1, cancellationToken);
            }
        }

        return updated;
    }
}
