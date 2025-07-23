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
    public class DataController : ControllerBase
    {
        private readonly ILogger<DataController> _logger;
        private readonly NineLanCacheUIDBContext _context;
        public DataController(ILogger<DataController> logger, NineLanCacheUIDBContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet]
        public async Task<GetHitMissModel> GetHitMiss([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
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

            var totalHitBytes = await query.SumAsync(e => e.CacheHitBytes);
            var totalMissBytes = await query.SumAsync(e => e.CacheMissBytes);

            return new GetHitMissModel
            {
                TotalHitBytes = totalHitBytes,
                TotalMissBytes = totalMissBytes
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetBytesByService([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
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

            var groupedData = await query
                .GroupBy(e => e.CacheIdentifier)
                .Select(g => new
                {
                    Service = ServiceNameFormatter.Format(g.Key),
                    TotalBytes = g.Sum(e => (long)(e.CacheHitBytes + e.CacheMissBytes))
                })
                .ToListAsync();

            var result = groupedData
                .Where(s =>
                    !string.IsNullOrEmpty(s.Service) &&
                    !s.Service.Contains("192") &&
                    !s.Service.Contains("10") &&
                    s.TotalBytes > 0)
                .ToList();

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetHitBytesByService([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
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

            var groupedData = await query
                .GroupBy(e => e.CacheIdentifier)
                .Select(g => new
                {
                    Service = ServiceNameFormatter.Format(g.Key),
                    TotalBytes = g.Sum(e => (long)e.CacheHitBytes)
                })
                .ToListAsync();

            var result = groupedData
                .Where(s =>
                    !string.IsNullOrEmpty(s.Service) &&
                    !s.Service.Contains("192") &&
                    !s.Service.Contains("10"))
                .ToList();

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetMissBytesByService([FromQuery] int days = 0, [FromQuery] bool excludeIPs = true)
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

            var groupedData = await query
                .GroupBy(e => e.CacheIdentifier)
                .Select(g => new
                {
                    Service = ServiceNameFormatter.Format(g.Key),
                    TotalBytes = g.Sum(e => (long)e.CacheMissBytes)
                })
                .ToListAsync();

            var result = groupedData
                .Where(s =>
                    !string.IsNullOrEmpty(s.Service) &&
                    !s.Service.Contains("192") &&
                    !s.Service.Contains("10"))
                .ToList();

            return Ok(result);
        }


    }
}
