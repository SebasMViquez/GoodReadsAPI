namespace GoodReadsAPI.Server.Contracts;

public sealed record HealthStatusResponse(
    string Status,
    string Environment,
    DateTimeOffset UtcNow
);
