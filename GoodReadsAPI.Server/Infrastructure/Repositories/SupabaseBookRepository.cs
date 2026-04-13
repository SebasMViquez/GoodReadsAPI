using System.Text.Json.Serialization;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Supabase;
using Microsoft.Extensions.Options;
using GoodReadsAPI.Server.Configuration;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public sealed class SupabaseBookRepository(
    ISupabaseRestClient supabase,
    IOptions<SupabaseOptions> options)
    : IBookRepository
{
    private readonly SupabaseOptions _options = options.Value;

    public async Task<IReadOnlyCollection<Book>> GetAllAsync(CancellationToken cancellationToken)
    {
        var rows = await supabase.GetManyAsync<BookRow>(
            _options.BooksTable,
            "order=year.desc",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<IReadOnlyCollection<Book>> GetByIdsAsync(
        IReadOnlyCollection<string> ids,
        CancellationToken cancellationToken)
    {
        if (ids.Count == 0)
        {
            return [];
        }

        var idFilter = string.Join(
            ',',
            ids
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct(StringComparer.Ordinal)
                .Select(Uri.EscapeDataString));

        if (string.IsNullOrWhiteSpace(idFilter))
        {
            return [];
        }

        var rows = await supabase.GetManyAsync<BookRow>(
            _options.BooksTable,
            $"id=in.({idFilter})",
            cancellationToken);

        return rows.Select(ToDomain).ToArray();
    }

    public async Task<Book?> GetByIdAsync(string id, CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<BookRow>(
            _options.BooksTable,
            $"id=eq.{Uri.EscapeDataString(id)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<Book?> GetBySlugAsync(string slug, CancellationToken cancellationToken)
    {
        var row = await supabase.GetSingleAsync<BookRow>(
            _options.BooksTable,
            $"slug=eq.{Uri.EscapeDataString(slug)}",
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public async Task<Book> CreateAsync(Book book, CancellationToken cancellationToken)
    {
        var row = await supabase.InsertAsync<BookRow>(
            _options.BooksTable,
            ToRow(book),
            cancellationToken);

        return ToDomain(row);
    }

    public async Task<Book?> UpdateAsync(string id, Book book, CancellationToken cancellationToken)
    {
        var payload = ToRow(book);
        payload.Id = id;

        var row = await supabase.UpdateSingleAsync<BookRow>(
            _options.BooksTable,
            $"id=eq.{Uri.EscapeDataString(id)}",
            payload,
            cancellationToken);

        return row is null ? null : ToDomain(row);
    }

    public Task<bool> DeleteAsync(string id, CancellationToken cancellationToken) =>
        supabase.DeleteAsync(
            _options.BooksTable,
            $"id=eq.{Uri.EscapeDataString(id)}",
            cancellationToken);

    private static Book ToDomain(BookRow row) =>
        new(
            Id: row.Id,
            Slug: row.Slug,
            Title: ToDomainText(row.Title),
            Subtitle: ToDomainText(row.Subtitle),
            AuthorId: row.AuthorId,
            Year: row.Year,
            PageCount: row.PageCount,
            Format: ToDomainText(row.Format),
            Rating: row.Rating,
            RatingCount: ToDomainText(row.RatingCount),
            Description: ToDomainText(row.Description),
            ShortDescription: ToDomainText(row.ShortDescription),
            Quote: ToDomainText(row.Quote),
            Cover: row.Cover,
            Backdrop: row.Backdrop,
            Genres: row.Genres,
            Mood: ToDomainText(row.Mood),
            Accent: row.Accent,
            Shelves: ToDomainText(row.Shelves),
            FriendsReading: row.FriendsReading,
            Featured: row.Featured,
            Trending: row.Trending,
            EditorPick: row.EditorPick);

    private static BookRow ToRow(Book book) =>
        new()
        {
            Id = book.Id,
            Slug = book.Slug,
            Title = ToRowText(book.Title),
            Subtitle = ToRowText(book.Subtitle),
            AuthorId = book.AuthorId,
            Year = book.Year,
            PageCount = book.PageCount,
            Format = ToRowText(book.Format),
            Rating = book.Rating,
            RatingCount = ToRowText(book.RatingCount),
            Description = ToRowText(book.Description),
            ShortDescription = ToRowText(book.ShortDescription),
            Quote = ToRowText(book.Quote),
            Cover = book.Cover,
            Backdrop = book.Backdrop,
            Genres = [.. book.Genres],
            Mood = ToRowText(book.Mood),
            Accent = book.Accent,
            Shelves = ToRowText(book.Shelves),
            FriendsReading = book.FriendsReading,
            Featured = book.Featured,
            Trending = book.Trending,
            EditorPick = book.EditorPick,
        };

    private static LocalizedText ToDomainText(LocalizedTextRow value) =>
        new(value.En, value.Es);

    private static LocalizedTextRow ToRowText(LocalizedText value) =>
        new()
        {
            En = value.En,
            Es = value.Es,
        };

    private sealed class BookRow
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("slug")]
        public string Slug { get; init; } = string.Empty;

        [JsonPropertyName("title")]
        public LocalizedTextRow Title { get; init; } = new();

        [JsonPropertyName("subtitle")]
        public LocalizedTextRow Subtitle { get; init; } = new();

        [JsonPropertyName("author_id")]
        public string AuthorId { get; init; } = string.Empty;

        [JsonPropertyName("year")]
        public int Year { get; init; }

        [JsonPropertyName("page_count")]
        public int PageCount { get; init; }

        [JsonPropertyName("format")]
        public LocalizedTextRow Format { get; init; } = new();

        [JsonPropertyName("rating")]
        public decimal Rating { get; init; }

        [JsonPropertyName("rating_count")]
        public LocalizedTextRow RatingCount { get; init; } = new();

        [JsonPropertyName("description")]
        public LocalizedTextRow Description { get; init; } = new();

        [JsonPropertyName("short_description")]
        public LocalizedTextRow ShortDescription { get; init; } = new();

        [JsonPropertyName("quote")]
        public LocalizedTextRow Quote { get; init; } = new();

        [JsonPropertyName("cover")]
        public string Cover { get; init; } = string.Empty;

        [JsonPropertyName("backdrop")]
        public string Backdrop { get; init; } = string.Empty;

        [JsonPropertyName("genres")]
        public string[] Genres { get; init; } = [];

        [JsonPropertyName("mood")]
        public LocalizedTextRow Mood { get; init; } = new();

        [JsonPropertyName("accent")]
        public string Accent { get; init; } = "#4A6FA5";

        [JsonPropertyName("shelves")]
        public LocalizedTextRow Shelves { get; init; } = new();

        [JsonPropertyName("friends_reading")]
        public int FriendsReading { get; init; }

        [JsonPropertyName("featured")]
        public bool Featured { get; init; }

        [JsonPropertyName("trending")]
        public bool Trending { get; init; }

        [JsonPropertyName("editor_pick")]
        public bool EditorPick { get; init; }
    }

    private sealed class LocalizedTextRow
    {
        [JsonPropertyName("en")]
        public string En { get; init; } = string.Empty;

        [JsonPropertyName("es")]
        public string Es { get; init; } = string.Empty;
    }
}
