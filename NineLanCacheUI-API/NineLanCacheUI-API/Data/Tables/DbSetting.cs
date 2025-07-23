using System.ComponentModel.DataAnnotations;

namespace NineLanCacheUI_API.Data.Tables
{
    public class DbSetting
    {
        [Key]
        public required string Key { get; set; }
        public string? Value { get; set; }

        public const string SettingKey_DepotVersion = nameof(SettingKey_DepotVersion);
        public const string SettingKey_SteamChangeNumber = nameof(SettingKey_SteamChangeNumber);
        public const string SettingKey_TotalBytesRead = nameof(SettingKey_TotalBytesRead);
    }
}
