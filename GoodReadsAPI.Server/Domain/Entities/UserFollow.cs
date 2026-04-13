namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record UserFollow(
    string FollowerId,
    string FollowedId,
    DateTimeOffset CreatedAt
);
