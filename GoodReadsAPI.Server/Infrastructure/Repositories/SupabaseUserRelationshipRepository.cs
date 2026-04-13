using System.Text.Json.Serialization;
using GoodReadsAPI.Server.Configuration;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.Extensions.Options;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public sealed class SupabaseUserRelationshipRepository(
    ISupabaseRestClient supabase,
    IOptions<SupabaseOptions> options)
    : IUserRelationshipRepository
{
    private readonly SupabaseOptions _options = options.Value;

    public async Task<IReadOnlyCollection<UserFollow>> GetFollowersAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await supabase.GetManyAsync<UserFollowRow>(
            _options.UserFollowsTable,
            $"followed_id=eq.{Uri.EscapeDataString(userId)}&order=created_at.desc",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<IReadOnlyCollection<UserFollow>> GetFollowingAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await supabase.GetManyAsync<UserFollowRow>(
            _options.UserFollowsTable,
            $"follower_id=eq.{Uri.EscapeDataString(userId)}&order=created_at.desc",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<bool> ExistsFollowAsync(
        string followerId,
        string followedId,
        CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<UserFollowRow>(
            _options.UserFollowsTable,
            $"follower_id=eq.{Uri.EscapeDataString(followerId)}&followed_id=eq.{Uri.EscapeDataString(followedId)}",
            cancellationToken);

        return row is not null;
    }

    public async Task<UserFollow> CreateFollowAsync(
        UserFollow follow,
        CancellationToken cancellationToken)
    {
        var row = await supabase.InsertAsync<UserFollowRow>(
            _options.UserFollowsTable,
            new
            {
                follower_id = follow.FollowerId,
                followed_id = follow.FollowedId,
                created_at = follow.CreatedAt.UtcDateTime,
            },
            cancellationToken);

        return ToDomain(row);
    }

    public Task<bool> DeleteFollowAsync(
        string followerId,
        string followedId,
        CancellationToken cancellationToken) =>
        supabase.DeleteAsync(
            _options.UserFollowsTable,
            $"follower_id=eq.{Uri.EscapeDataString(followerId)}&followed_id=eq.{Uri.EscapeDataString(followedId)}",
            cancellationToken);

    public async Task<FollowRequest?> GetPendingFollowRequestAsync(
        string requesterId,
        string targetUserId,
        CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<FollowRequestRow>(
            _options.FollowRequestsTable,
            $"requester_id=eq.{Uri.EscapeDataString(requesterId)}&target_user_id=eq.{Uri.EscapeDataString(targetUserId)}&status=eq.pending",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<FollowRequest> CreateFollowRequestAsync(
        FollowRequest request,
        CancellationToken cancellationToken)
    {
        var row = await supabase.InsertAsync<FollowRequestRow>(
            _options.FollowRequestsTable,
            new
            {
                id = request.Id,
                requester_id = request.RequesterId,
                target_user_id = request.TargetUserId,
                status = request.Status,
                created_at = request.CreatedAt.UtcDateTime,
                responded_at = request.RespondedAt?.UtcDateTime,
            },
            cancellationToken);

        return ToDomain(row);
    }

    public async Task<IReadOnlyCollection<FollowRequest>> GetFollowRequestsForTargetAsync(
        string targetUserId,
        string status,
        CancellationToken cancellationToken)
    {
        var query = $"target_user_id=eq.{Uri.EscapeDataString(targetUserId)}";
        if (!string.IsNullOrWhiteSpace(status))
        {
            query += $"&status=eq.{Uri.EscapeDataString(status)}";
        }

        query += "&order=created_at.desc";

        var rows = await supabase.GetManyAsync<FollowRequestRow>(
            _options.FollowRequestsTable,
            query,
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<FollowRequest?> GetFollowRequestByIdAsync(
        string requestId,
        CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<FollowRequestRow>(
            _options.FollowRequestsTable,
            $"id=eq.{Uri.EscapeDataString(requestId)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<FollowRequest?> UpdateFollowRequestStatusAsync(
        string requestId,
        string status,
        DateTimeOffset respondedAt,
        CancellationToken cancellationToken)
    {
        var row = await supabase.UpdateSingleAsync<FollowRequestRow>(
            _options.FollowRequestsTable,
            $"id=eq.{Uri.EscapeDataString(requestId)}",
            new
            {
                status,
                responded_at = respondedAt.UtcDateTime,
            },
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    private static UserFollow ToDomain(UserFollowRow row) =>
        new(
            FollowerId: row.FollowerId,
            FollowedId: row.FollowedId,
            CreatedAt: row.CreatedAt);

    private static FollowRequest ToDomain(FollowRequestRow row) =>
        new(
            Id: row.Id,
            RequesterId: row.RequesterId,
            TargetUserId: row.TargetUserId,
            Status: row.Status,
            CreatedAt: row.CreatedAt,
            RespondedAt: row.RespondedAt);

    private sealed class UserFollowRow
    {
        [JsonPropertyName("follower_id")]
        public string FollowerId { get; init; } = string.Empty;

        [JsonPropertyName("followed_id")]
        public string FollowedId { get; init; } = string.Empty;

        [JsonPropertyName("created_at")]
        public DateTimeOffset CreatedAt { get; init; }
    }

    private sealed class FollowRequestRow
    {
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;

        [JsonPropertyName("requester_id")]
        public string RequesterId { get; init; } = string.Empty;

        [JsonPropertyName("target_user_id")]
        public string TargetUserId { get; init; } = string.Empty;

        [JsonPropertyName("status")]
        public string Status { get; init; } = "pending";

        [JsonPropertyName("created_at")]
        public DateTimeOffset CreatedAt { get; init; }

        [JsonPropertyName("responded_at")]
        public DateTimeOffset? RespondedAt { get; init; }
    }
}
