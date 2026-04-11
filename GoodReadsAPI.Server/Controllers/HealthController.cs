using GoodReadsAPI.Server.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace GoodReadsAPI.Server.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController(IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(HealthStatusResponse), StatusCodes.Status200OK)]
    public ActionResult<HealthStatusResponse> Get()
    {
        var response = new HealthStatusResponse(
            Status: "ok",
            Environment: environment.EnvironmentName,
            UtcNow: DateTimeOffset.UtcNow);

        return Ok(response);
    }
}
