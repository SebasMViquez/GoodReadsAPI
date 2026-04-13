using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace GoodReadsAPI.Server.Infrastructure.Auth;

public sealed class LegacyUserIdAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "LegacyUserId";
    private const string CurrentUserHeader = "X-User-Id";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var userId = ResolveUserIdFromRequest();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var normalizedUserId = userId.Trim();
        var claims = new[]
        {
            new Claim("sub", normalizedUserId),
            new Claim(ClaimTypes.NameIdentifier, normalizedUserId),
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    private string? ResolveUserIdFromRequest()
    {
        if (Request.Headers.TryGetValue(CurrentUserHeader, out var headerValues))
        {
            var headerUserId = headerValues.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(headerUserId))
            {
                return headerUserId;
            }
        }

        if (Request.Query.TryGetValue("userId", out var queryValues))
        {
            var queryUserId = queryValues.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(queryUserId))
            {
                return queryUserId;
            }
        }

        return null;
    }
}
