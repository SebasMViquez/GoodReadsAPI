using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record UserResponse(
    string Id,
    string Name,
    string Username,
    string Email,
    string Avatar,
    string Banner,
    LocalizedTextDto Role,
    LocalizedTextDto Bio,
    string Location,
    string Website,
    string ProfileVisibility,
    int FollowersCount,
    int FollowingCount,
    int BooksRead,
    LocalizedTextDto PagesRead,
    int Streak,
    IReadOnlyCollection<string> FavoriteGenres,
    IReadOnlyCollection<LocalizedTextDto> Badges
)
{
    public static UserResponse FromDomain(User user) =>
        new(
            Id: user.Id,
            Name: user.Name,
            Username: user.Username,
            Email: user.Email,
            Avatar: user.Avatar,
            Banner: user.Banner,
            Role: LocalizedTextDto.FromDomain(user.Role),
            Bio: LocalizedTextDto.FromDomain(user.Bio),
            Location: user.Location,
            Website: user.Website,
            ProfileVisibility: user.ProfileVisibility,
            FollowersCount: user.FollowersCount,
            FollowingCount: user.FollowingCount,
            BooksRead: user.BooksRead,
            PagesRead: LocalizedTextDto.FromDomain(user.PagesRead),
            Streak: user.Streak,
            FavoriteGenres: user.FavoriteGenres,
            Badges: user.Badges.Select(LocalizedTextDto.FromDomain).ToArray());
}
