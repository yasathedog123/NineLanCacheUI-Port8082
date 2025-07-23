using NineLanCacheUI_API.Steam;
namespace NineLanCacheUI_API.Services.OriginalDepotEnricher
{
    public class OriginalSteamAppObtainerService : ISteamAppObtainerService
    {
        public App? GetSteamAppById(uint? steamAppId)
        {
            if (steamAppId != null && SteamApi.SteamAppDict.TryGetValue(steamAppId.Value, out var app))
            {
                return app;
            }
            return null;
        }
    }
}
