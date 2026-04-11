using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record SaveBookRequest(
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
    public Book ToDomain() =>
        new(
            Id: Id,
            Slug: Slug,
            Title: Title.ToDomain(),
            Subtitle: Subtitle.ToDomain(),
            AuthorId: AuthorId,
            Year: Year,
            PageCount: PageCount,
            Format: Format.ToDomain(),
            Rating: Rating,
            RatingCount: RatingCount.ToDomain(),
            Description: Description.ToDomain(),
            ShortDescription: ShortDescription.ToDomain(),
            Quote: Quote.ToDomain(),
            Cover: Cover,
            Backdrop: Backdrop,
            Genres: Genres,
            Mood: Mood.ToDomain(),
            Accent: Accent,
            Shelves: Shelves.ToDomain(),
            FriendsReading: FriendsReading,
            Featured: Featured,
            Trending: Trending,
            EditorPick: EditorPick);
}
