using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record LibraryEntryResponse(
    string UserId,
    string BookId,
    string ShelfStatus,
    int Progress,
    bool IsFavorite,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
)
{
    public static LibraryEntryResponse FromDomain(UserBookLibraryEntry entry) =>
        new(
            UserId: entry.UserId,
            BookId: entry.BookId,
            ShelfStatus: entry.ShelfStatus,
            Progress: entry.Progress,
            IsFavorite: entry.IsFavorite,
            CreatedAt: entry.CreatedAt,
            UpdatedAt: entry.UpdatedAt);
}
