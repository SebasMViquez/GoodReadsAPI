namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record User(
    string Id,
    string Name,
    string Username,
    string Email,
    string Avatar,
    string Banner,
    LocalizedText Role,
    LocalizedText Bio,
    string Location,
    string Website,
    string ProfileVisibility,
    int FollowersCount,
    int FollowingCount,
    int BooksRead,
    LocalizedText PagesRead,
    int Streak,
    IReadOnlyCollection<string> FavoriteGenres,
    IReadOnlyCollection<LocalizedText> Badges
);
