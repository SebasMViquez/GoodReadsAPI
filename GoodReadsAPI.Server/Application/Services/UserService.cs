using GoodReadsAPI.Server.Application.Interfaces;
using GoodReadsAPI.Server.Domain.Entities;
using GoodReadsAPI.Server.Infrastructure.Repositories;
using GoodReadsAPI.Server.Infrastructure.Supabase;

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

    public async Task<User?> UpdateProfileAsync(
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
        CancellationToken cancellationToken)
    {
        var normalizedUsername = NormalizeUsername(username);
        if (string.IsNullOrWhiteSpace(normalizedUsername))
        {
            throw new ArgumentException("Username is required and must contain valid characters.", nameof(username));
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalizedEmail))
        {
            throw new ArgumentException("Email is required.", nameof(email));
        }

        var normalizedVisibility = profileVisibility.Trim().ToLowerInvariant();
        if (normalizedVisibility is not ("public" or "private"))
        {
            throw new ArgumentException("Profile visibility must be public or private.", nameof(profileVisibility));
        }

        var currentUser = await ResolveCurrentUserAsync(currentUserId, normalizedEmail, cancellationToken);

        var existingByUsername = await userRepository.GetByUsernameAsync(normalizedUsername, cancellationToken);
        if (existingByUsername is not null &&
            !string.Equals(existingByUsername.Id, currentUser?.Id, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("That username is already taken.");
        }

        var existingByEmail = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingByEmail is not null &&
            !string.Equals(existingByEmail.Id, currentUser?.Id, StringComparison.Ordinal))
        {
            throw new InvalidOperationException("That email is already in use.");
        }

        var normalizedLocale = string.Equals(locale, "es", StringComparison.OrdinalIgnoreCase) ? "es" : "en";
        var baseRole = currentUser?.Role ?? new LocalizedText(string.Empty, string.Empty);
        var baseBio = currentUser?.Bio ?? new LocalizedText(string.Empty, string.Empty);
        var nextRole = normalizedLocale == "es"
            ? baseRole with { Es = role.Trim() }
            : baseRole with { En = role.Trim() };
        var nextBio = normalizedLocale == "es"
            ? baseBio with { Es = bio.Trim() }
            : baseBio with { En = bio.Trim() };

        var update = new UserProfileUpdate(
            Name: name.Trim(),
            Username: normalizedUsername,
            Email: normalizedEmail,
            Avatar: avatar.Trim(),
            Banner: banner.Trim(),
            Role: nextRole,
            Bio: nextBio,
            Location: location.Trim(),
            Website: website.Trim(),
            ProfileVisibility: normalizedVisibility);

        if (currentUser is not null)
        {
            return await userRepository.UpdateProfileAsync(currentUser.Id, update, cancellationToken);
        }

        var authUserId = Guid.TryParse(currentUserId, out _) ? currentUserId : null;
        var createUserId = currentUserId;
        return await userRepository.CreateProfileAsync(
            createUserId,
            authUserId,
            update,
            cancellationToken);
    }

    private async Task<User?> ResolveCurrentUserAsync(
        string currentUserId,
        string normalizedEmail,
        CancellationToken cancellationToken)
    {
        var byId = await userRepository.GetByIdAsync(currentUserId, cancellationToken);
        if (byId is not null)
        {
            return byId;
        }

        try
        {
            var byAuthId = await userRepository.GetByAuthUserIdAsync(currentUserId, cancellationToken);
            if (byAuthId is not null)
            {
                return byAuthId;
            }
        }
        catch (SupabaseRequestException ex) when (IsMissingAuthUserIdColumn(ex))
        {
            // Keep update flow resilient when DB migration 005 has not been applied yet.
        }

        return await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
    }

    private static bool IsMissingAuthUserIdColumn(SupabaseRequestException exception) =>
        exception.Details?.Contains("auth_user_id", StringComparison.OrdinalIgnoreCase) == true &&
        exception.Details?.Contains("does not exist", StringComparison.OrdinalIgnoreCase) == true;

    private static string NormalizeUsername(string value)
    {
        var candidate = value.Trim().TrimStart('@').ToLowerInvariant();
        var filtered = new string(candidate.Where(ch =>
            char.IsLetterOrDigit(ch) || ch == '-' || ch == '_').ToArray());

        return filtered;
    }
}
