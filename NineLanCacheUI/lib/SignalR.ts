import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;
let NGINX_URL = process.env.NGINX_URL;
if (process.env.NODE_ENV === "development") {
  NGINX_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
}

export function getSignalRConnection(): signalR.HubConnection {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`${NGINX_URL}/uirefreshhub`,{
        withCredentials: true,
        skipNegotiation: true, // Use WebSockets directly
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
  }

  return connection;
}
