import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = (userId: string) => {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:5154/chathub?userId=${userId}`, {
      accessTokenFactory: () => localStorage.getItem("token") || "",
    })
    .withAutomaticReconnect()
    .build();

  return connection;
};

export const getConnection = () => {
  return connection;
};

export const stopConnection = async () => {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    try {
      await connection.stop();
      console.log("SignalR connection stopped successfully.");
    } catch (err) {
      console.error("Error stopping connection:", err);
    }
  }
  connection = null;
};
