import * as signalR from "@microsoft/signalr";

let connection: signalR.HubConnection | null = null;

export const createConnection = (userId: string) => {
  if (!connection) {
    connection = new signalR.HubConnectionBuilder()
      .withUrl(`/chathub?userId=${userId}`)
      .withAutomaticReconnect()
      .build();
  }
  return connection;
};

export const getConnection = () => {
  return connection;
};

export const stopConnection = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};
