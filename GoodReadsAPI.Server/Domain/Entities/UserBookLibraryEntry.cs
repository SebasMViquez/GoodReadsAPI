namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record UserBookLibraryEntry(
    string UserId,
    string BookId,
    string ShelfStatus,
    int Progress,
    bool IsFavorite,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
