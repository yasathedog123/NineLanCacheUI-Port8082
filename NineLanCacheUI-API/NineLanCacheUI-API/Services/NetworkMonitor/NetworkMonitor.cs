using Microsoft.EntityFrameworkCore;
using NineLanCacheUI_API.Data.Tables;
using ProtoBuf.Meta;
using System.Net.NetworkInformation;
using DbContext = NineLanCacheUI_API.Data.NineLanCacheUIDBContext;

namespace NineLanCacheUI_API.Services.NetworkMonitor
{
    public class NetworkMonitor
    {
        private class InterfaceSnapshot
        {
            public long BytesSent;
            public long BytesReceived;
        }

        private readonly Dictionary<string, InterfaceSnapshot> _previous = new();
        private readonly IServiceProvider _services;

        public NetworkMonitor(IServiceProvider services)
        {
            _services = services;
        }

        public async Task PollAndSaveAsync()
        {
            var scope = _services.CreateAsyncScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DbContext>();

            var cutoff = DateTime.UtcNow.AddHours(-1);
            await dbContext.Stats
                .Where(s => s.Timestamp < cutoff)
                .ExecuteDeleteAsync();

            var interfaces = NetworkInterface.GetAllNetworkInterfaces();
            foreach (var ni in interfaces)
            {
                if (ni.NetworkInterfaceType == NetworkInterfaceType.Loopback ||
                    ni.OperationalStatus != OperationalStatus.Up ||
                    ni.Description.Contains("Virtual") ||
                    ni.Name.StartsWith("veth") ||
                    ni.Description.Contains("Pseudo") ||
                    ni.Name.Contains("Local"))
                {
                    continue;
                }


                var stats = ni.GetIPv4Statistics();
                var now = DateTime.UtcNow;

                var name = ni.Name;

                var sent = stats.BytesSent;
                var received = stats.BytesReceived;

                if (_previous.TryGetValue(name, out var prev))
                {
                    var bytesSentPerSec = (sent - prev.BytesSent) * 2; // since 500ms polling
                    var bytesReceivedPerSec = (received - prev.BytesReceived) * 2;

                    dbContext.Stats.Add(new DbNetworkInterfaceStat
                    {
                        InterfaceName = name,
                        BytesSentPerSec = bytesSentPerSec,
                        BytesReceivedPerSec = bytesReceivedPerSec,
                        Timestamp = now
                    });
                }

                _previous[name] = new InterfaceSnapshot
                {
                    BytesSent = sent,
                    BytesReceived = received
                };
            }

            await dbContext.SaveChangesAsync();
        }
    }
}
