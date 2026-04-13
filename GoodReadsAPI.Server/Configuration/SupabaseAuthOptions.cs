namespace GoodReadsAPI.Server.Configuration;

public sealed class SupabaseAuthOptions
{
    public const string SectionName = "SupabaseAuth";

    public bool Enabled { get; init; }

    public string Authority { get; init; } = string.Empty;

    public string Audience { get; init; } = "authenticated";

    public bool RequireHttpsMetadata { get; init; } = true;

    public bool AllowLegacyUserIdFallback { get; init; } = true;

    public bool IsConfigured =>
        Enabled &&
        !string.IsNullOrWhiteSpace(Authority) &&
        !string.IsNullOrWhiteSpace(Audience);
}
