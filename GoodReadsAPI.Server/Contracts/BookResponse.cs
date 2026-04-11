using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record BookResponse(
    string Id,
    string Slug,
    LocalizedTextDto Title,
    LocalizedTextDto Subtitle,
    string AuthorId,
    int Year,
    int PageCount,
    LocalizedTextDto Format,
    decimal Rating,
    LocalizedTextDto RatingCount,
    LocalizedTextDto Description,
    LocalizedTextDto ShortDescription,
    LocalizedTextDto Quote,
    string Cover,
    string Backdrop,
    IReadOnlyCollection<string> Genres,
    LocalizedTextDto Mood,
    string Accent,
    LocalizedTextDto Shelves,
    int FriendsReading,
    bool Featured,
    bool Trending,
    bool EditorPick
)
{
    public static BookResponse FromDomain(Book book) =>
        new(
            Id: book.Id,
            Slug: book.Slug,
            Title: LocalizedTextDto.FromDomain(book.Title),
            Subtitle: LocalizedTextDto.FromDomain(book.Subtitle),
            AuthorId: book.AuthorId,
            Year: book.Year,
            PageCount: book.PageCount,
            Format: LocalizedTextDto.FromDomain(book.Format),
            Rating: book.Rating,
            RatingCount: LocalizedTextDto.FromDomain(book.RatingCount),
            Description: LocalizedTextDto.FromDomain(book.Description),
            ShortDescription: LocalizedTextDto.FromDomain(book.ShortDescription),
            Quote: LocalizedTextDto.FromDomain(book.Quote),
            Cover: book.Cover,
            Backdrop: book.Backdrop,
            Genres: book.Genres,
            Mood: LocalizedTextDto.FromDomain(book.Mood),
            Accent: book.Accent,
            Shelves: LocalizedTextDto.FromDomain(book.Shelves),
            FriendsReading: book.FriendsReading,
            Featured: book.Featured,
            Trending: book.Trending,
            EditorPick: book.EditorPick);
}
