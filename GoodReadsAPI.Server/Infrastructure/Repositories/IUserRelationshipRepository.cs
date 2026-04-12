using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public interface IUserRelationshipRepository
{
    Task<IReadOnlyCollection<UserFollow>> GetFollowersAsync(string userId, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<UserFollow>> GetFollowingAsync(string userId, CancellationToken cancellationToken);

    Task<bool> ExistsFollowAsync(
        string followerId,
        string followedId,
        CancellationToken cancellationToken);

    Task<UserFollow> CreateFollowAsync(UserFollow follow, CancellationToken cancellationToken);

    Task<bool> DeleteFollowAsync(
        string followerId,
        string followedId,
        CancellationToken cancellationToken);

    Task<FollowRequest?> GetPendingFollowRequestAsync(
        string requesterId,
        string targetUserId,
        CancellationToken cancellationToken);

    Task<FollowRequest> CreateFollowRequestAsync(
        FollowRequest request,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<FollowRequest>> GetFollowRequestsForTargetAsync(
        string targetUserId,
        string status,
        CancellationToken cancellationToken);

    Task<FollowRequest?> GetFollowRequestByIdAsync(
        string requestId,
        CancellationToken cancellationToken);

    Task<FollowRequest?> UpdateFollowRequestStatusAsync(
        string requestId,
        string status,
        DateTimeOffset respondedAt,
        CancellationToken cancellationToken);
}
