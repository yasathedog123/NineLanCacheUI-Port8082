namespace NineLanCacheUI_API.Services.NetworkMonitor
{
    public class NetworkPollingService : IHostedService
    {
        private Timer _timer;
        private readonly NetworkMonitor _monitor;
        private readonly IServiceProvider _services;
        public NetworkPollingService(IServiceProvider services)
        {
            _monitor = new NetworkMonitor(services);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(async _ => await _monitor.PollAndSaveAsync(), null, 0, 500);
            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Dispose();
            return Task.CompletedTask;
        }
    }

}
