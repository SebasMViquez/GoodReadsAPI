using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<IReadOnlyCollection<User>> GetAllAsync(CancellationToken cancellationToken);

    Task<User?> GetByIdAsync(string id, CancellationToken cancellationToken);

    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken);

    Task<IReadOnlyCollection<User>> GetByIdsAsync(
        IReadOnlyCollection<string> ids,
        CancellationToken cancellationToken);

    Task<bool> IncrementFollowersCountAsync(
        string userId,
        int delta,
        CancellationToken cancellationToken);

    Task<bool> IncrementFollowingCountAsync(
        string userId,
        int delta,
        CancellationToken cancellationToken);
}
