using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Application.Interfaces;

public interface IUserLibraryService
{
    Task<IReadOnlyCollection<UserBookLibraryEntry>> GetLibraryAsync(
        string userId,
        CancellationToken cancellationToken);

    Task<UserBookLibraryEntry> SetShelfAsync(
        string userId,
        string bookId,
        string shelfStatus,
        CancellationToken cancellationToken);

    Task<UserBookLibraryEntry?> SetFavoriteAsync(
        string userId,
        string bookId,
        bool isFavorite,
        CancellationToken cancellationToken);

    Task<UserBookLibraryEntry> UpdateProgressAsync(
        string userId,
        string bookId,
        int progress,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<FollowingFavoriteBooks>> GetFollowingFavoriteBooksAsync(
        string userId,
        CancellationToken cancellationToken);
}
