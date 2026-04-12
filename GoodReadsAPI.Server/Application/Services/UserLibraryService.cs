using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Repositories;

namespace GoodReadsAPI.Server.Application.Services;

public sealed class UserLibraryService(
    IUserLibraryRepository userLibraryRepository,
    IUserRelationshipRepository userRelationshipRepository,
    IUserRepository userRepository,
    IBookRepository bookRepository)
    : IUserLibraryService
{
    private static readonly HashSet<string> ValidShelfStatuses = new(StringComparer.Ordinal)
    {
        "want-to-read",
        "currently-reading",
        "read",
    };

    public Task<IReadOnlyCollection<UserBookLibraryEntry>> GetLibraryAsync(
        string userId,
        CancellationToken cancellationToken) =>
        userLibraryRepository.GetByUserIdAsync(userId, cancellationToken);

    public async Task<UserBookLibraryEntry> SetShelfAsync(
        string userId,
        string bookId,
        string shelfStatus,
        CancellationToken cancellationToken)
    {
        if (!ValidShelfStatuses.Contains(shelfStatus))
        {
            throw new ArgumentException("Invalid shelf status.", nameof(shelfStatus));
        }

        var existing = await userLibraryRepository.GetByUserAndBookAsync(userId, bookId, cancellationToken);

        if (existing is null)
        {
            return await userLibraryRepository.CreateAsync(
                new UserBookLibraryEntry(
                    UserId: userId,
                    BookId: bookId,
                    ShelfStatus: shelfStatus,
                    Progress: shelfStatus == "currently-reading" ? 18 : 0,
                    IsFavorite: false,
                    CreatedAt: DateTimeOffset.UtcNow,
                    UpdatedAt: DateTimeOffset.UtcNow),
                cancellationToken);
        }

        var nextProgress = existing.Progress;
        if (shelfStatus == "currently-reading" && nextProgress <= 0)
        {
            nextProgress = 18;
        }

        var updated = await userLibraryRepository.UpdateAsync(
            userId,
            bookId,
            existing with
            {
                ShelfStatus = shelfStatus,
                Progress = nextProgress,
                UpdatedAt = DateTimeOffset.UtcNow,
            },
            cancellationToken);

        return updated ?? throw new InvalidOperationException("Failed to update shelf state.");
    }

    public async Task<UserBookLibraryEntry?> SetFavoriteAsync(
        string userId,
        string bookId,
        bool isFavorite,
        CancellationToken cancellationToken)
    {
        var existing = await userLibraryRepository.GetByUserAndBookAsync(userId, bookId, cancellationToken);

        if (existing is null)
        {
            if (!isFavorite)
            {
                return null;
            }

            return await userLibraryRepository.CreateAsync(
                new UserBookLibraryEntry(
                    UserId: userId,
                    BookId: bookId,
                    ShelfStatus: "want-to-read",
                    Progress: 0,
                    IsFavorite: true,
                    CreatedAt: DateTimeOffset.UtcNow,
                    UpdatedAt: DateTimeOffset.UtcNow),
                cancellationToken);
        }

        if (existing.IsFavorite == isFavorite)
        {
            return existing;
        }

        var updated = await userLibraryRepository.UpdateAsync(
            userId,
            bookId,
            existing with
            {
                IsFavorite = isFavorite,
                UpdatedAt = DateTimeOffset.UtcNow,
            },
            cancellationToken);

        return updated ?? throw new InvalidOperationException("Failed to update favorite state.");
    }

    public async Task<UserBookLibraryEntry> UpdateProgressAsync(
        string userId,
        string bookId,
        int progress,
        CancellationToken cancellationToken)
    {
        var normalizedProgress = Math.Clamp(progress, 0, 100);
        var existing = await userLibraryRepository.GetByUserAndBookAsync(userId, bookId, cancellationToken);

        if (existing is null)
        {
            return await userLibraryRepository.CreateAsync(
                new UserBookLibraryEntry(
                    UserId: userId,
                    BookId: bookId,
                    ShelfStatus: "currently-reading",
                    Progress: normalizedProgress,
                    IsFavorite: false,
                    CreatedAt: DateTimeOffset.UtcNow,
                    UpdatedAt: DateTimeOffset.UtcNow),
                cancellationToken);
        }

        var updated = await userLibraryRepository.UpdateAsync(
            userId,
            bookId,
            existing with
            {
                ShelfStatus = "currently-reading",
                Progress = normalizedProgress,
                UpdatedAt = DateTimeOffset.UtcNow,
            },
            cancellationToken);

        return updated ?? throw new InvalidOperationException("Failed to update reading progress.");
    }

    public async Task<IReadOnlyCollection<FollowingFavoriteBooks>> GetFollowingFavoriteBooksAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var following = await userRelationshipRepository.GetFollowingAsync(userId, cancellationToken);
        var followingIds = following
            .Select(entry => entry.FollowedId)
            .Distinct(StringComparer.Ordinal)
            .ToArray();

        if (followingIds.Length == 0)
        {
            return [];
        }

        var favorites = await userLibraryRepository.GetFavoritesByUserIdsAsync(followingIds, cancellationToken);
        if (favorites.Count == 0)
        {
            return [];
        }

        var booksById = (await bookRepository.GetByIdsAsync(
            favorites.Select(entry => entry.BookId).Distinct(StringComparer.Ordinal).ToArray(),
            cancellationToken))
            .ToDictionary(book => book.Id, StringComparer.Ordinal);

        var usersById = (await userRepository.GetByIdsAsync(followingIds, cancellationToken))
            .ToDictionary(user => user.Id, StringComparer.Ordinal);

        var favoritesByUser = favorites
            .GroupBy(entry => entry.UserId, StringComparer.Ordinal)
            .ToDictionary(group => group.Key, group => group.ToArray(), StringComparer.Ordinal);

        var output = new List<FollowingFavoriteBooks>();

        foreach (var followEntry in following)
        {
            if (!usersById.TryGetValue(followEntry.FollowedId, out var followedUser))
            {
                continue;
            }

            if (!favoritesByUser.TryGetValue(followEntry.FollowedId, out var userFavorites))
            {
                continue;
            }

            var favoriteBooks = userFavorites
                .Select(entry => booksById.GetValueOrDefault(entry.BookId))
                .Where(book => book is not null)
                .Cast<Book>()
                .DistinctBy(book => book.Id)
                .ToArray();

            if (favoriteBooks.Length == 0)
            {
                continue;
            }

            output.Add(new FollowingFavoriteBooks(
                User: followedUser,
                FavoriteBooks: favoriteBooks));
        }

        return output;
    }
}
