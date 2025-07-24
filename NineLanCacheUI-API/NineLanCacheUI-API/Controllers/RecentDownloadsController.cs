using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NineLanCacheUI_API.Data;
using NineLanCacheUI_API.Models;
using System.Linq;
using NineLanCacheUI_API.Helpers;
using NineLanCacheUI_API.Data.Tables;
using NineLanCacheUI_API.Services;

namespace NineLanCacheUI_API.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class RecentDownloadsController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;
        private readonly NineLanCacheUIDBContext _context;
        private readonly ISteamAppObtainerService _steamAppObtainerService;
        public RecentDownloadsController(ILogger<DataController> logger, NineLanCacheUIDBContext context, ISteamAppObtainerService steamAppObtainerService)
        {
            _logger = logger;
            _context = context;
            _steamAppObtainerService = steamAppObtainerService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRecentDownloads([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true, [FromQuery] int limit = 0)
        {
            var excludedIps = excludeIPs
                ? await _context.ExcludedIps.Select(x => x.IpAddress.Trim()).ToArrayAsync()
                : Array.Empty<string>();

            IQueryable<DbDownloadEvent> queryableEvents = _context.DownloadEvents;

            // Apply IP exclusion
            if (excludeIPs)
            {
                queryableEvents = queryableEvents.Where(e => !excludedIps.Contains(e.ClientIp));
            }

            // Apply date filter
            if (days > 0)
            {
                var since = DateTime.UtcNow.AddDays(-days);
                queryableEvents = queryableEvents.Where(e => e.LastUpdatedAt >= since);
            }

            // Only include events with cache hits or misses
            queryableEvents = queryableEvents.Where(e => e.CacheHitBytes != 0 || e.CacheMissBytes != 0);

            int takeNumber = limit > 0 ? limit : 100;
            var recentEventsSubquery = queryableEvents
                .OrderByDescending(e => e.LastUpdatedAt)
                .Take(takeNumber);

            var joined = from e in recentEventsSubquery
                         join depot in _context.SteamDepots
                             on e.DownloadIdentifier equals depot.SteamDepotId into depotJoin
                         from depot in depotJoin.DefaultIfEmpty()
                         let manifest = (from m in _context.SteamManifests
                                         where m.DepotId == e.DownloadIdentifier
                                         orderby m.CreationTime descending
                                         select m).FirstOrDefault()
                         orderby e.LastUpdatedAt descending
                         select new
                         {
                             e,
                             depot,
                             manifest
                         };

            var rawResults = await joined.ToListAsync();

            var grouped = rawResults.GroupBy(x => x.e);

            var result = grouped.Select(group =>
            {
                var first = group.First();

                var totalBytes = (first.manifest?.TotalCompressedSize ?? 0) + (first.manifest?.ManifestBytesSize ?? 0);

                var dto = new DownloadEvent
                {
                    Id = group.Key.Id,
                    CacheIdentifier = group.Key.CacheIdentifier,
                    DownloadIdentifier = group.Key.DownloadIdentifier,
                    DownloadIdentifierString = group.Key.DownloadIdentifierString,
                    ClientIp = group.Key.ClientIp,
                    CreatedAt = group.Key.CreatedAt,
                    LastUpdatedAt = group.Key.LastUpdatedAt,
                    CacheHitBytes = group.Key.CacheHitBytes,
                    CacheMissBytes = group.Key.CacheMissBytes,
                    TotalBytes = totalBytes,
                    SteamDepot = group.Key.CacheIdentifier != "steam" || first.depot == null
                        ? null
                        : new SteamDepot
                        {
                            Id = first.depot.SteamDepotId,
                            SteamAppId = first.depot.SteamAppId,
                            SteamApp = _steamAppObtainerService.GetSteamAppById(first.depot.SteamAppId)
                        }
                };

                return dto;
            }).ToList();

            return Ok(result);
        }




    }
}
