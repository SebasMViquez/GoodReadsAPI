using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public interface IUserLibraryRepository
{
    Task<IReadOnlyCollection<UserBookLibraryEntry>> GetByUserIdAsync(
        string userId,
        CancellationToken cancellationToken);

    Task<UserBookLibraryEntry?> GetByUserAndBookAsync(
        string userId,
        string bookId,
        CancellationToken cancellationToken);

    Task<UserBookLibraryEntry> CreateAsync(
        UserBookLibraryEntry entry,
        CancellationToken cancellationToken);

    Task<UserBookLibraryEntry?> UpdateAsync(
        string userId,
        string bookId,
        UserBookLibraryEntry entry,
        CancellationToken cancellationToken);

    Task<IReadOnlyCollection<UserBookLibraryEntry>> GetFavoritesByUserIdsAsync(
        IReadOnlyCollection<string> userIds,
        CancellationToken cancellationToken);
}
