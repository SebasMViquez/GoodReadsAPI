using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record FollowRequestResponse(
    string Id,
    string RequesterId,
    string TargetUserId,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? RespondedAt
)
{
    public static FollowRequestResponse FromDomain(FollowRequest request) =>
        new(
            Id: request.Id,
            RequesterId: request.RequesterId,
            TargetUserId: request.TargetUserId,
            Status: request.Status,
            CreatedAt: request.CreatedAt,
            RespondedAt: request.RespondedAt);
}
