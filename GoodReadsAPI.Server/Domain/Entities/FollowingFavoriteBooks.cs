namespace GoodReadsAPI.Server.Domain.Entities;

public sealed record FollowingFavoriteBooks(
    User User,
    IReadOnlyCollection<Book> FavoriteBooks
);
