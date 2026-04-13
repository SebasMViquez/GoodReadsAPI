using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Application.Interfaces;

public interface ISocialGraphService
{
    Task<IReadOnlyCollection<User>> GetFollowersAsync(string userId, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<User>> GetFollowingAsync(string userId, CancellationToken cancellationToken);

    Task<FollowOperationResult> FollowAsync(
        string currentUserId,
        string targetUserId,
        CancellationToken cancellationToken);

    Task<bool> UnfollowAsync(
        string currentUserId,
        string targetUserId,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<FollowRequest>> GetPendingFollowRequestsAsync(
        string currentUserId,
        CancellationToken cancellationToken);

    Task<FollowRequest?> RespondToFollowRequestAsync(
        string currentUserId,
        string requestId,
        string status,
        CancellationToken cancellationToken);
}
