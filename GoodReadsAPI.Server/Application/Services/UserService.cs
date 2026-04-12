using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Repositories;

namespace GoodReadsAPI.Server.Application.Services;

public sealed class UserService(IUserRepository userRepository) : IUserService
{
    public async Task<IReadOnlyCollection<User>> SearchAsync(
        string? query,
        string? visibility,
        CancellationToken cancellationToken)
    {
        var users = await userRepository.GetAllAsync(cancellationToken);
        var filtered = users.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalizedQuery = query.Trim();

            filtered = filtered.Where(user =>
                user.Name.Contains(normalizedQuery, StringComparison.OrdinalIgnoreCase) ||
                user.Username.Contains(normalizedQuery, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(visibility))
        {
            var normalizedVisibility = visibility.Trim();
            filtered = filtered.Where(user =>
                string.Equals(
                    user.ProfileVisibility,
                    normalizedVisibility,
                    StringComparison.OrdinalIgnoreCase));
        }

        return filtered.ToArray();
    }

    public Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken) =>
        userRepository.GetByUsernameAsync(username, cancellationToken);
}
