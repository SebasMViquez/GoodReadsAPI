namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record UserProfileUpdate(
    string Name,
    string Username,
    string Email,
    string Avatar,
    string Banner,
    LocalizedText Role,
    LocalizedText Bio,
    string Location,
    string Website,
    string ProfileVisibility
);
