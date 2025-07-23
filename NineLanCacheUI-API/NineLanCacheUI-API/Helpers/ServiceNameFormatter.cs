namespace NineLanCacheUI_API.Helpers
{
    public static class ServiceNameFormatter
    {
        private static readonly Dictionary<string, string> ServiceDisplayNames = new(StringComparer.OrdinalIgnoreCase)
        {
            { "steam", "Steam" },
            { "epicgames", "Epic Games" },
            { "blizzard", "Battle.net" },
            { "wsus", "Windows Update" },
            { "cod", "Call Of Duty" },
            { "riot", "Riot Games" },
            { "xboxlive", "Xbox Live" },
            { "uplay", "Uplay" },
        };

        public static string Format(string rawService)
        {
            return ServiceDisplayNames.TryGetValue(rawService.Trim(), out var displayName)
                    ? displayName
                    : rawService;
        }
    }
}
