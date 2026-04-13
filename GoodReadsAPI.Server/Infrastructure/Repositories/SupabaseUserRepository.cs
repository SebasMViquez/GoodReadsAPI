using System.Text.Json.Serialization;
using GoodReadsAPI.Server.Configuration;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.Extensions.Options;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public sealed class SupabaseUserRepository(
    ISupabaseRestClient supabase,
    IOptions<SupabaseOptions> options)
    : IUserRepository
{
    private readonly SupabaseOptions _options = options.Value;

    public async Task<IReadOnlyCollection<User>> GetAllAsync(CancellationToken cancellationToken)
    {
        var rows = await supabase.GetManyAsync<UserRow>(
            _options.UsersTable,
            "order=followers_count.desc,name.asc",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<UserRow>(
            _options.UsersTable,
            $"id=eq.{Uri.EscapeDataString(id)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<User?> GetByAuthUserIdAsync(string authUserId, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(authUserId, out var parsedAuthUserId))
        {
            return null;
        }

        var row = await supabase.GetSingleAsync<UserRow>(
            _options.UsersTable,
            $"auth_user_id=eq.{Uri.EscapeDataString(parsedAuthUserId.ToString())}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken)
    {
        var normalized = username.Trim();

        var row = await supabase.GetSingleAsync<UserRow>(
            _options.UsersTable,
            $"username=eq.{Uri.EscapeDataString(normalized)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken)
    {
        var normalized = email.Trim().ToLowerInvariant();

        var row = await supabase.GetSingleAsync<UserRow>(
            _options.UsersTable,
            $"email=eq.{Uri.EscapeDataString(normalized)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<User?> UpdateProfileAsync(
        string userId,
        UserProfileUpdate update,
        CancellationToken cancellationToken)
    {
        var row = await supabase.UpdateSingleAsync<UserRow>(
            _options.UsersTable,
            $"id=eq.{Uri.EscapeDataString(userId)}",
            new
            {
                name = update.Name,
                username = update.Username,
                email = update.Email,
                avatar = update.Avatar,
                banner = update.Banner,
                role = new
                {
                    en = update.Role.En,
                    es = update.Role.Es,
                },
                bio = new
                {
                    en = update.Bio.En,
                    es = update.Bio.Es,
                },
                location = update.Location,
                website = update.Website,
                profile_visibility = update.ProfileVisibility,
            },
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<User> CreateProfileAsync(
        string userId,
        string? authUserId,
        UserProfileUpdate profile,
        CancellationToken cancellationToken)
    {
        var payload = new Dictionary<string, object?>
        {
            ["id"] = userId,
            ["name"] = profile.Name,
            ["username"] = profile.Username,
            ["email"] = profile.Email,
            ["avatar"] = profile.Avatar,
            ["banner"] = profile.Banner,
            ["role"] = new
            {
                en = profile.Role.En,
                es = profile.Role.Es,
            },
            ["bio"] = new
            {
                en = profile.Bio.En,
                es = profile.Bio.Es,
            },
            ["location"] = profile.Location,
            ["website"] = profile.Website,
            ["profile_visibility"] = profile.ProfileVisibility,
            ["followers_count"] = 0,
            ["following_count"] = 0,
            ["books_read"] = 0,
            ["pages_read"] = new { en = string.Empty, es = string.Empty },
            ["streak"] = 0,
            ["favorite_genres"] = Array.Empty<string>(),
            ["badges"] = Array.Empty<object>(),
        };

        if (!string.IsNullOrWhiteSpace(authUserId) && Guid.TryParse(authUserId, out var parsedAuthId))
        {
            payload["auth_user_id"] = parsedAuthId;
        }

        var row = await supabase.InsertAsync<UserRow>(
            _options.UsersTable,
            payload,
            cancellationToken);

        return ToDomain(row);
    }

    public async Task<IReadOnlyCollection<User>> GetByIdsAsync(
        IReadOnlyCollection<string> ids,
        CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
        {
            return [];
        }

        var idFilter = BuildInFilter(ids);
        if (string.IsNullOrWhiteSpace(idFilter))
        {
            return [];
        }

        var rows = await supabase.GetManyAsync<UserRow>(
            _options.UsersTable,
            $"id=in.({idFilter})",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<bool> IncrementFollowersCountAsync(
        string userId,
        int delta,
        CancellationToken cancellationToken)
    {
        var current = await supabase.GetSingleAsync<UserCountersRow>(
            _options.UsersTable,
            $"id=eq.{Uri.EscapeDataString(userId)}",
            cancellationToken);

        if (current is null)
        {
            return false;
        }

        var nextFollowers = Math.Max(0, current.FollowersCount + delta);

        var updated = await supabase.UpdateSingleAsync<UserCountersRow>(
            _options.UsersTable,
            $"id=eq.{Uri.EscapeDataString(userId)}",
            new
            {
                followers_count = nextFollowers,
            },
            cancellationToken);

        return updated is not null;
    }

    public async Task<bool> IncrementFollowingCountAsync(
        string userId,
        int delta,
        CancellationToken cancellationToken)
    {
        var current = await supabase.GetSingleAsync<UserCountersRow>(
            _options.UsersTable,
            $"id=eq.{Uri.EscapeDataString(userId)}",
            cancellationToken);

        if (current is null)
        {
            return false;
        }

        var nextFollowing = Math.Max(0, current.FollowingCount + delta);

        var updated = await supabase.UpdateSingleAsync<UserCountersRow>(
            _options.UsersTable,
            $"id=eq.{Uri.EscapeDataString(userId)}",
            new
            {
                following_count = nextFollowing,
            },
            cancellationToken);

        return updated is not null;
    }

    private static string BuildInFilter(IEnumerable<string> ids) =>
        string.Join(
            ',',
            ids
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct(StringComparer.Ordinal)
                .Select(Uri.EscapeDataString));

    private static User ToDomain(UserRow row) =>
        new(
            Id: row.Id,
            Name: row.Name,
            Username: row.Username,
            Email: row.Email,
            Avatar: row.Avatar,
            Banner: row.Banner,
            Role: ToDomainText(row.Role),
            Bio: ToDomainText(row.Bio),
            Location: row.Location,
            Website: row.Website,
            ProfileVisibility: row.ProfileVisibility,
            FollowersCount: row.FollowersCount,
            FollowingCount: row.FollowingCount,
            BooksRead: row.BooksRead,
            PagesRead: ToDomainText(row.PagesRead),
            Streak: row.Streak,
            FavoriteGenres: row.FavoriteGenres,
            Badges: row.Badges.Select(ToDomainText).ToArray());

    private static LocalizedText ToDomainText(LocalizedTextRow value) =>
        new(value.En, value.Es);

    private sealed class UserRow
    {
        [JsonPropertyName("id")]
        public string Id { get; init; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; init; } = string.Empty;

        [JsonPropertyName("username")]
        public string Username { get; init; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; init; } = string.Empty;

        [JsonPropertyName("avatar")]
        public string Avatar { get; init; } = string.Empty;

        [JsonPropertyName("banner")]
        public string Banner { get; init; } = string.Empty;

        [JsonPropertyName("role")]
        public LocalizedTextRow Role { get; init; } = new();

        [JsonPropertyName("bio")]
        public LocalizedTextRow Bio { get; init; } = new();

        [JsonPropertyName("location")]
        public string Location { get; init; } = string.Empty;

        [JsonPropertyName("website")]
        public string Website { get; init; } = string.Empty;

        [JsonPropertyName("profile_visibility")]
        public string ProfileVisibility { get; init; } = "public";

        [JsonPropertyName("followers_count")]
        public int FollowersCount { get; init; }

        [JsonPropertyName("following_count")]
        public int FollowingCount { get; init; }

        [JsonPropertyName("books_read")]
        public int BooksRead { get; init; }

        [JsonPropertyName("pages_read")]
        public LocalizedTextRow PagesRead { get; init; } = new();

        [JsonPropertyName("streak")]
        public int Streak { get; init; }

        [JsonPropertyName("favorite_genres")]
        public string[] FavoriteGenres { get; init; } = [];

        [JsonPropertyName("badges")]
        public LocalizedTextRow[] Badges { get; init; } = [];
    }

    private sealed class UserCountersRow
    {
        [JsonPropertyName("followers_count")]
        public int FollowersCount { get; init; }

        [JsonPropertyName("following_count")]
        public int FollowingCount { get; init; }
    }

    private sealed class LocalizedTextRow
    {
        [JsonPropertyName("en")]
        public string En { get; init; } = string.Empty;

        [JsonPropertyName("es")]
        public string Es { get; init; } = string.Empty;
    }
}
