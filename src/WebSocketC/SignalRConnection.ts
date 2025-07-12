import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = (userId: string) => {
  if (connection) return connection;

  const baseUrl = "https://spagchat.runasp.net";

  const hubUrl = `${baseUrl}/chathub?userId=${userId}`;
  console.log("🔗 Attempting to connect to SignalR hub:", hubUrl);

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("❌ No token found for SignalR connection");
          throw new Error("No authentication token available");
        }
        console.log("🔑 Using token for SignalR: Token present");
        // console.log("🔍 Token length:", token.length);
        // console.log("🔍 Token starts with:", token.substring(0, 20) + "...");
        return token;
      },

      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
      withCredentials: true, 
    })
    .withAutomaticReconnect()
    .build();

  return connection;
};

export const connectionInstance = () => connection;

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
