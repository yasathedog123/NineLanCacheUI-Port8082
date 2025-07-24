using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NineLanCacheUI_API.Data;
using NineLanCacheUI_API.Models;
using System.Linq;
using NineLanCacheUI_API.Helpers;

namespace NineLanCacheUI_API.Controllers
{
    [Route("[controller]/[action]")]
    [ApiController]
    public class StatsController : ControllerBase
    {
        private readonly ILogger<StatsController> _logger;
        private readonly NineLanCacheUIDBContext _context;
        public StatsController(ILogger<StatsController> logger, NineLanCacheUIDBContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetClientHitMissGrid([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
        {
            var query = _context.DownloadEvents.AsQueryable();

            if (excludeIPs)
            {
                var ips = await _context.ExcludedIps
                    .Select(x => x.IpAddress.Trim())
                    .ToListAsync();

                query = query.Where(e => !ips.Contains(e.ClientIp));
            }

            if (days > 0)
            {
                var since = DateTime.UtcNow.AddDays(-days);
                query = query.Where(e => e.LastUpdatedAt >= since);
            }

            query = query.Where(e => e.CacheHitBytes != 0 || e.CacheMissBytes != 0);

            // Group by user and calculate total hits and misses
            var results = await query
                .GroupBy(e => e.ClientIp)
                .OrderByDescending(g => g.Sum(x => x.CacheHitBytes + x.CacheMissBytes))
                .Select(g => new
                {
                    IPAddress = g.Key,
                    TotalHits = g.Sum(x => x.CacheHitBytes),
                    TotalMisses = g.Sum(x => x.CacheMissBytes)
                })
                .ToListAsync();

            return Ok(results);
            
        }

        [HttpGet]
        public async Task<IActionResult> GetClientHits([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
        {
            var query = _context.DownloadEvents.AsQueryable();

            if (excludeIPs)
            {
                var ips = await _context.ExcludedIps
                    .Select(x => x.IpAddress.Trim())
                    .ToListAsync();

                query = query.Where(e => !ips.Contains(e.ClientIp));
            }

            if (days > 0)
            {
                var since = DateTime.UtcNow.AddDays(-days);
                query = query.Where(e => e.LastUpdatedAt >= since);
            }

            query = query.Where(e => e.CacheHitBytes != 0 || e.CacheMissBytes != 0);

            // Group by user and calculate total hits and misses
            var results = await query
                .GroupBy(e => e.ClientIp)
                .OrderByDescending(g => g.Sum(x => x.CacheHitBytes))
                .Select(g => new
                {
                    IPAddress = g.Key,
                    TotalBytes = g.Sum(x => x.CacheHitBytes)
                })
                .ToListAsync();

            return Ok(results);
        }

        [HttpGet]
        public async Task<IActionResult> GetClientMisses([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
        {
            var query = _context.DownloadEvents.AsQueryable();

            if (excludeIPs)
            {
                var ips = await _context.ExcludedIps
                    .Select(x => x.IpAddress.Trim())
                    .ToListAsync();

                query = query.Where(e => !ips.Contains(e.ClientIp));
            }

            if (days > 0)
            {
                var since = DateTime.UtcNow.AddDays(-days);
                query = query.Where(e => e.LastUpdatedAt >= since);
            }

            query = query.Where(e => e.CacheHitBytes != 0 || e.CacheMissBytes != 0);

            // Group by user and calculate total hits and misses
            var results = await query
                .GroupBy(e => e.ClientIp)
                .OrderByDescending(g => g.Sum(x => x.CacheMissBytes))
                .Select(g => new
                {
                    IPAddress = g.Key,
                    TotalBytes = g.Sum(x => x.CacheMissBytes)
                })
                .ToListAsync();

            return Ok(results);
        }

        


    }
}
