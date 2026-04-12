using Microsoft.AspNetCore.Mvc;

namespace GoodReadsAPI.Server.Controllers;

internal static class ControllerUserIdResolver
{
    private const string CurrentUserHeader = "X-User-Id";

    public static bool TryResolveCurrentUserId(this ControllerBase controller, out string userId)
    {
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
}
