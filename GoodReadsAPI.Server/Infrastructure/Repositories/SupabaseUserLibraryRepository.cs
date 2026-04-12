using System.Text.Json.Serialization;
using GoodReadsAPI.Server.Configuration;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.Extensions.Options;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public sealed class SupabaseUserLibraryRepository(
    ISupabaseRestClient supabase,
    IOptions<SupabaseOptions> options)
    : IUserLibraryRepository
{
    private readonly SupabaseOptions _options = options.Value;

    public async Task<IReadOnlyCollection<UserBookLibraryEntry>> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var rows = await supabase.GetManyAsync<UserBookLibraryRow>(
            _options.UserBookLibraryTable,
            $"user_id=eq.{Uri.EscapeDataString(userId)}&order=updated_at.desc",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<UserBookLibraryEntry?> GetByUserAndBookAsync(
        string userId,
        string bookId,
        CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<UserBookLibraryRow>(
            _options.UserBookLibraryTable,
            $"user_id=eq.{Uri.EscapeDataString(userId)}&book_id=eq.{Uri.EscapeDataString(bookId)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<UserBookLibraryEntry> CreateAsync(
        UserBookLibraryEntry entry,
        CancellationToken cancellationToken)
    {
        var row = await supabase.InsertAsync<UserBookLibraryRow>(
            _options.UserBookLibraryTable,
            new
            {
                user_id = entry.UserId,
                book_id = entry.BookId,
                shelf_status = entry.ShelfStatus,
                progress = entry.Progress,
                is_favorite = entry.IsFavorite,
            },
            cancellationToken);

        return ToDomain(row);
    }

    public async Task<UserBookLibraryEntry?> UpdateAsync(
        string userId,
        string bookId,
        UserBookLibraryEntry entry,
        CancellationToken cancellationToken)
    {
        var row = await supabase.UpdateSingleAsync<UserBookLibraryRow>(
            _options.UserBookLibraryTable,
            $"user_id=eq.{Uri.EscapeDataString(userId)}&book_id=eq.{Uri.EscapeDataString(bookId)}",
            new
            {
                shelf_status = entry.ShelfStatus,
                progress = entry.Progress,
                is_favorite = entry.IsFavorite,
            },
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<IReadOnlyCollection<UserBookLibraryEntry>> GetFavoritesByUserIdsAsync(
        IReadOnlyCollection<string> userIds,
        CancellationToken cancellationToken)
    {
        if (userIds.Count == 0)
        {
            return [];
        }

        var userFilter = string.Join(
            ',',
            userIds
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct(StringComparer.Ordinal)
                .Select(Uri.EscapeDataString));

        if (string.IsNullOrWhiteSpace(userFilter))
        {
            return [];
        }

        var rows = await supabase.GetManyAsync<UserBookLibraryRow>(
            _options.UserBookLibraryTable,
            $"user_id=in.({userFilter})&is_favorite=eq.true&order=updated_at.desc",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    private static UserBookLibraryEntry ToDomain(UserBookLibraryRow row) =>
        new(
            UserId: row.UserId,
            BookId: row.BookId,
            ShelfStatus: row.ShelfStatus,
            Progress: row.Progress,
            IsFavorite: row.IsFavorite,
            CreatedAt: row.CreatedAt,
            UpdatedAt: row.UpdatedAt);

    private sealed class UserBookLibraryRow
    {
        [JsonPropertyName("user_id")]
        public string UserId { get; init; } = string.Empty;

        [JsonPropertyName("book_id")]
        public string BookId { get; init; } = string.Empty;

        [JsonPropertyName("shelf_status")]
        public string ShelfStatus { get; init; } = "want-to-read";

        [JsonPropertyName("progress")]
        public int Progress { get; init; }

        [JsonPropertyName("is_favorite")]
        public bool IsFavorite { get; init; }

        [JsonPropertyName("created_at")]
        public DateTimeOffset CreatedAt { get; init; }

        [JsonPropertyName("updated_at")]
        public DateTimeOffset UpdatedAt { get; init; }
    }
}
