namespace GoodReadsAPI.Server.Configuration;

public sealed class SupabaseOptions
{
    public const string SectionName = "Supabase";

    public string Url { get; init; } = string.Empty;

    public string ServiceRoleKey { get; init; } = string.Empty;

    public string Schema { get; init; } = "public";

    public string BooksTable { get; init; } = "books";

    public string UsersTable { get; init; } = "users";

    public string UserFollowsTable { get; init; } = "user_follows";

    public string FollowRequestsTable { get; init; } = "follow_requests";

    public string UserBookLibraryTable { get; init; } = "user_book_library";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Url) &&
        !string.IsNullOrWhiteSpace(ServiceRoleKey);
}
