namespace GoodReadsAPI.Server.Configuration;

public sealed class SupabaseOptions
{
    public const string SectionName = "Supabase";

    public string Url { get; init; } = string.Empty;

    public string ServiceRoleKey { get; init; } = string.Empty;

    public string Schema { get; init; } = "public";

    public string BooksTable { get; init; } = "books";

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(Url) &&
        !string.IsNullOrWhiteSpace(ServiceRoleKey);
}
