using System.Security.Claims;
using GoodReadsAPI.Server.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoodReadsAPI.Server.Controllers;

internal static class ControllerUserIdResolver
{
    private const string CurrentUserHeader = "X-User-Id";

    public static bool TryResolveCurrentUserId(this ControllerBase controller, out string userId)
    {
        if (controller.User.Identity?.IsAuthenticated == true)
        {
            var claimUserId =
                controller.User.FindFirstValue("app_user_id") ??
                controller.User.FindFirstValue("sub") ??
                controller.User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!string.IsNullOrWhiteSpace(claimUserId))
            {
                userId = claimUserId.Trim();
                return true;
            }
        }

        if (!IsLegacyFallbackAllowed(controller))
        {
            userId = string.Empty;
            return false;
        }

        if (controller.Request.Headers.TryGetValue(CurrentUserHeader, out var headerValues))
        {
            var candidate = headerValues.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(candidate))
            {
                userId = candidate;
                return true;
            }
        }

        if (controller.Request.Query.TryGetValue("userId", out var queryValues))
        {
            var candidate = queryValues.ToString().Trim();
            if (!string.IsNullOrWhiteSpace(candidate))
            {
                userId = candidate;
                return true;
            }
        }

        userId = string.Empty;
        return false;
    }

    private static bool IsLegacyFallbackAllowed(ControllerBase controller)
    {
        var options = controller.HttpContext.RequestServices
            .GetService<IOptions<SupabaseAuthOptions>>()
            ?.Value;

        if (options is null || !options.Enabled)
        {
            return true;
        }

        return options.AllowLegacyUserIdFallback;
    }
}
