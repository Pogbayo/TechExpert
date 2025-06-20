import React, { createContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import {
  createConnection,
  stopConnection,
} from "../../WebSocketC/SignalRConnection";
import type { SignalContextType } from "../../Types/ContextTypes/contextType";

// eslint-disable-next-line react-refresh/only-export-components
export const SignalContext = createContext<SignalContextType | undefined>(
  undefined
);

export const SignalProvider: React.FC<{
  userId: string;
  children: React.ReactNode;
}> = ({ userId, children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );

  useEffect(() => {
    if (!userId) return;
    const newConnection = createConnection(userId);

    const startConnection = async () => {
      if (newConnection.state === signalR.HubConnectionState.Disconnected) {
        try {
          await newConnection.start();
          console.log("Connected to SignalR hub.");
          setConnection(newConnection);
        } catch (err) {
          console.error("SignalR Connection Error: ", err);
        }
      } else {
        console.log("Connection is already starting or started.");
      }
    };

    startConnection();

    return () => {
      stopConnection().then(() => console.log("SignalR connection stopped."));
      setConnection(null);
    };
  }, [userId]);

  return (
    <SignalContext.Provider value={{ connection }}>
      {children}
    </SignalContext.Provider>
  );
};
