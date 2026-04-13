namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record Book(
    string Id,
    string Slug,
    LocalizedText Title,
    LocalizedText Subtitle,
    string AuthorId,
    int Year,
    int PageCount,
    LocalizedText Format,
    decimal Rating,
    LocalizedText RatingCount,
    LocalizedText Description,
    LocalizedText ShortDescription,
    LocalizedText Quote,
    string Cover,
    string Backdrop,
    IReadOnlyCollection<string> Genres,
    LocalizedText Mood,
    string Accent,
    LocalizedText Shelves,
    int FriendsReading,
    bool Featured,
    bool Trending,
    bool EditorPick
);
