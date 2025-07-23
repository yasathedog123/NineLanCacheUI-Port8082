using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NineLanCacheUI_API.Data;
using NineLanCacheUI_API.Models;
using System.Linq;

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
        public async Task<IActionResult> Test()
        {
            return Ok("API is working correctly.");
        }

        [HttpGet]
        public async Task<GetHitMissModel> GetHitMiss()
        {
            var excludedIPs = await _context.Settings
                .Where(s => s.Key == "ExcludedIPs")
                .Select(s => s.Value)
                .ToListAsync();

            excludedIPs = excludedIPs.SelectMany(ip => ip.Split(','))
                                     .Select(ip => ip.Trim())
                                     .Where(ip => !string.IsNullOrEmpty(ip))
                                     .ToList();

            var totalHitBytes = await _context.DownloadEvents
                .Where(e => !excludedIPs.Contains(e.ClientIp))
                .SumAsync(e => e.CacheHitBytes);

            var totalMissBytes = await _context.DownloadEvents
                .Where(e => !excludedIPs.Contains(e.ClientIp))
                .SumAsync(e => e.CacheMissBytes);

            return new GetHitMissModel
            {
                TotalHitBytes = totalHitBytes,
                TotalMissBytes = totalMissBytes
            };
        }

        [HttpGet]
        public async Task<IActionResult> GetBytesByService()
        {
            var excludedIPs = await _context.Settings
                .Where(s => s.Key == "ExcludedIPs")
                .Select(s => s.Value)
                .ToListAsync();

            excludedIPs = excludedIPs
                .SelectMany(ip => ip.Split(','))
                .Select(ip => ip.Trim())
                .Where(ip => !string.IsNullOrEmpty(ip))
                .ToList();

            var groupedData = await _context.DownloadEvents
                .Where(e => !excludedIPs.Contains(e.ClientIp))
                .GroupBy(e => e.CacheIdentifier)
                .Select(g => new
                {
                    Service = g.Key,
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

    }
}
