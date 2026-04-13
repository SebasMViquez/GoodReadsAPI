using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record FollowingFavoritesResponse(
    UserResponse User,
    IReadOnlyCollection<BookResponse> FavoriteBooks
)
{
    public static FollowingFavoritesResponse FromDomain(FollowingFavoriteBooks value) =>
        new(
            User: UserResponse.FromDomain(value.User),
            FavoriteBooks: value.FavoriteBooks.Select(BookResponse.FromDomain).ToArray());
}
