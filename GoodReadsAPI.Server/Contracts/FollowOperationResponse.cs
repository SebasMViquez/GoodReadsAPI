using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record FollowOperationResponse(
    string Outcome,
    FollowRequestResponse? FollowRequest
)
{
    public static FollowOperationResponse FromDomain(FollowOperationResult result) =>
        new(
            Outcome: result.Outcome,
            FollowRequest: result.FollowRequest is null ? null : FollowRequestResponse.FromDomain(result.FollowRequest));
}
