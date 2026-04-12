using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Application.Interfaces;

public interface IUserService
{
    Task<IReadOnlyCollection<User>> SearchAsync(
        string? query,
        string? visibility,
        CancellationToken cancellationToken);

    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken);
}
