namespace NineLanCacheUI_API.Data.Tables
{
    public class DbNetworkInterfaceStat
    {
        public int Id { get; set; }
        public string InterfaceName { get; set; }
        public long BytesSentPerSec { get; set; }
        public long BytesReceivedPerSec { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
