using Microsoft.AspNetCore.SignalR;

namespace NineLanCacheUI_API.Hubs
{
    public class UIRefreshHub : Hub
    {
        public async Task RefreshUI()
        {
            // Notify all connected clients to refresh the UI
            await Clients.All.SendAsync("RefreshUI");
        }
        public override Task OnConnectedAsync()
        {
            return base.OnConnectedAsync();
        }
        public override Task OnDisconnectedAsync(Exception? exception)
        {
            return base.OnDisconnectedAsync(exception);
        }
    }
}
