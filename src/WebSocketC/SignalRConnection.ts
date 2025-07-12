import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = (userId: string) => {
  if (connection) return connection;

  const baseUrl = "https://spagchat.runasp.net";

  const hubUrl = `${baseUrl}/chathub?userId=${userId}`;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token available");
        }
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
    } catch (err:unknown) {
      // Silent fail
      console.log(err)
    }
  }
  connection = null;
};
