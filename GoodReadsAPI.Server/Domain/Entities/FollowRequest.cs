namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record FollowRequest(
    string Id,
    string RequesterId,
    string TargetUserId,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? RespondedAt
);
