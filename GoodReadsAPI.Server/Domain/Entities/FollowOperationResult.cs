namespace GoodReadsAPI.Server.Domain.Entities;

public static class FollowOperationOutcomes
{
    public const string Followed = "followed";
    public const string Requested = "requested";
    public const string AlreadyFollowing = "already-following";
    public const string RequestAlreadyPending = "request-already-pending";
    public const string CannotFollowSelf = "cannot-follow-self";
    public const string CurrentUserNotFound = "current-user-not-found";
    public const string TargetUserNotFound = "target-user-not-found";
}

public sealed record FollowOperationResult(
    string Outcome,
    FollowRequest? FollowRequest = null
);
