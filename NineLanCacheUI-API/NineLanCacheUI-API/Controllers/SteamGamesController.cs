using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NineLanCacheUI_API.Data;
using NineLanCacheUI_API.Models;
using System.Linq;
using NineLanCacheUI_API.Helpers;
using NineLanCacheUI_API.Services;

namespace NineLanCacheUI_API.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class SteamGamesController : ControllerBase
    {
        private readonly ILogger<SteamGamesController> _logger;
        private readonly NineLanCacheUIDBContext _context;
        private readonly ISteamAppObtainerService _steamAppObtainerService;
        public SteamGamesController(ILogger<SteamGamesController> logger, NineLanCacheUIDBContext context, ISteamAppObtainerService steamAppObtainerService)
        {
            _logger = logger;
            _context = context;
            _steamAppObtainerService = steamAppObtainerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetSteamGames()
        {

            var queryableEvents = _context.DownloadEvents
                .Where(e => e.CacheIdentifier == "steam" && (e.CacheHitBytes > 0 || e.CacheMissBytes > 0));

            var appIds = await (
                from e in queryableEvents
                join depot in _context.SteamDepots on e.DownloadIdentifier equals depot.SteamDepotId
                select depot.SteamAppId
            ).Distinct().ToListAsync();

            var steamApps = appIds
                .Select(id => _steamAppObtainerService.GetSteamAppById(id))
                .Where(app => app != null)
                .OrderBy(app => app.name)
                .ToList();

            return Ok(steamApps);

        }
    }
}
