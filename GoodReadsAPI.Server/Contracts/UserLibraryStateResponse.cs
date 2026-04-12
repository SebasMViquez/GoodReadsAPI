using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record UserLibraryStateResponse(
    IReadOnlyDictionary<string, IReadOnlyCollection<string>> Shelves,
    IReadOnlyCollection<string> Favorites,
    IReadOnlyDictionary<string, int> ProgressMap,
    IReadOnlyCollection<LibraryEntryResponse> Entries
)
{
    public static UserLibraryStateResponse FromEntries(IReadOnlyCollection<UserBookLibraryEntry> entries)
    {
        var ordered = entries.OrderByDescending(entry => entry.UpdatedAt).ToArray();

        var shelves = new Dictionary<string, IReadOnlyCollection<string>>
        {
            ["want-to-read"] = ordered
                .Where(entry => entry.ShelfStatus == "want-to-read")
                .Select(entry => entry.BookId)
                .ToArray(),
            ["currently-reading"] = ordered
                .Where(entry => entry.ShelfStatus == "currently-reading")
                .Select(entry => entry.BookId)
                .ToArray(),
            ["read"] = ordered
                .Where(entry => entry.ShelfStatus == "read")
                .Select(entry => entry.BookId)
                .ToArray(),
        };

        var favorites = ordered
            .Where(entry => entry.IsFavorite)
            .Select(entry => entry.BookId)
            .ToArray();

        var progressMap = ordered
            .Where(entry => entry.Progress > 0)
            .ToDictionary(entry => entry.BookId, entry => entry.Progress);

        return new(
            Shelves: shelves,
            Favorites: favorites,
            ProgressMap: progressMap,
            Entries: ordered.Select(LibraryEntryResponse.FromDomain).ToArray());
    }
}
