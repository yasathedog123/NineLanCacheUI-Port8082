using NineLanCacheUI_API.Steam;

namespace NineLanCacheUI_API.Services
{
    public interface ISteamAppObtainerService
    {
        App? GetSteamAppById(uint? steamAppId);
    }
}
