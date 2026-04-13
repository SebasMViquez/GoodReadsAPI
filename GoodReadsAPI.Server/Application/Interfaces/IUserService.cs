using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Application.Interfaces;

public interface IUserService
{
    Task<IReadOnlyCollection<User>> SearchAsync(
        string? query,
        string? visibility,
        CancellationToken cancellationToken);

    Task<User?> UpdateProfileAsync(
        string currentUserId,
        string locale,
        string name,
        string username,
        string email,
        string avatar,
        string banner,
        string role,
        string bio,
        string location,
        string website,
        string profileVisibility,
        CancellationToken cancellationToken);

    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken);
}
