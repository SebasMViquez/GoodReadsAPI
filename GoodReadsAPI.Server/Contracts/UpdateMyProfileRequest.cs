namespace GoodReadsAPI.Server.Contracts;

public sealed record UpdateMyProfileRequest(
    string Locale,
    string Name,
    string Username,
    string Email,
    string Avatar,
    string Banner,
    string Role,
    string Bio,
    string Location,
    string Website,
    string ProfileVisibility
);
