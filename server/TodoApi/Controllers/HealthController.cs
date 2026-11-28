using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TodoApi.Controllers;

[ApiController]
public class HealthController : ControllerBase
{
    [HttpGet("/ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
    }
}