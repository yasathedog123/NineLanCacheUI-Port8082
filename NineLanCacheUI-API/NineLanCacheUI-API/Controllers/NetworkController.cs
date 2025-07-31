using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NineLanCacheUI_API.Data;
using NineLanCacheUI_API.Services.NetworkMonitor;

namespace NineLanCacheUI_API.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class NetworkController : ControllerBase
    {
        private readonly ILogger<NetworkController> _logger;
        private readonly NineLanCacheUIDBContext _context;
        public NetworkController(ILogger<NetworkController> logger, NineLanCacheUIDBContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetNetworkStats([FromQuery] string inter, [FromQuery] int minutes = 5)
        {
            if (string.IsNullOrWhiteSpace(inter))
                return BadRequest("Missing interface name.");

            var cutoff = DateTime.UtcNow.AddMinutes(-minutes);

            var stats = await _context.Stats
                .Where(s => s.InterfaceName == inter && s.Timestamp >= cutoff)
                .OrderBy(s => s.Timestamp)
                .ToListAsync();

            if (!stats.Any())
                return NotFound("No network statistics found.");

            return Ok(stats);
        }


        [HttpGet]
        public async Task<IActionResult> GetNetworkInterfaces()
        {
            var interfaces = await _context.Stats
                .OrderByDescending(i => i.Timestamp)
                .Select(s => s.InterfaceName)
                .Distinct()
                .ToListAsync();
            if (interfaces == null || !interfaces.Any())
            {
                return NotFound("No network interfaces found.");
            }
            return Ok(interfaces);
        }

        [HttpGet]
        public async Task<IActionResult> GetLatestNetworkStat([FromQuery] string inter)
        {
            if (string.IsNullOrWhiteSpace(inter))
                return BadRequest("Missing interface name.");

            var latestStat = await _context.Stats
                .Where(s => s.InterfaceName == inter)
                .OrderByDescending(s => s.Timestamp)
                .FirstOrDefaultAsync();

            if (latestStat == null)
                return NotFound("No network statistics found.");

            return Ok(latestStat);
        }

    }
}
