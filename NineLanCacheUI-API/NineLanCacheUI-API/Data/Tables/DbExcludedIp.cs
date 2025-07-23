using System.ComponentModel.DataAnnotations;

namespace NineLanCacheUI_API.Data.Tables{
    public class DbExcludedIp
    {
        [Key]
        public int Id { get; set; }
        public string IpAddress { get; set; } = null!;
    }
}