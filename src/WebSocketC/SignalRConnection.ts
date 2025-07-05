import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = (userId: string) => {
  if (connection) return connection;

  const baseUrl =
    import.meta.env.MODE === "development"
      ? "http://localhost:5154"
      : "https://spagchat.runasp.net";

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${baseUrl}/chathub?userId=${userId}`, {
      accessTokenFactory: () => localStorage.getItem("token") || "",

      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
      withCredentials: true, 
    })
    .withAutomaticReconnect()
    .build();

  return connection;
};

export const getConnection = () => {
  return connection;
};

export const stopConnection = async () => {
  if (
    connection &&
    connection.state !== signalR.HubConnectionState.Disconnected
  ) {
    try {
      await connection.stop();
      console.log("SignalR connection stopped successfully.");
    } catch (err) {
      console.error("Error stopping connection:", err);
    }
  }
  connection = null;
};
