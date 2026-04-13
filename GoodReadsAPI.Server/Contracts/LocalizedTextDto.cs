using GoodReadsAPI.Server.Domain.Entities;

namespace GoodReadsAPI.Server.Contracts;

public sealed record LocalizedTextDto(
    string En,
    string Es
)
{
    public static LocalizedTextDto FromDomain(LocalizedText value) =>
        new(value.En, value.Es);

    public LocalizedText ToDomain() =>
        new(En, Es);
}
