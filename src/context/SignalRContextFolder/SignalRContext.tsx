// src/context/SignalContext.tsx
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
    const newConnection = createConnection(userId);

    newConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR hub.");
        setConnection(newConnection);
      })
      .catch((err) => console.error("SignalR Connection Error: ", err));

    return () => {
      stopConnection();
    };
  }, [userId]);

  return (
    <SignalContext.Provider value={{ connection }}>
      {children}
    </SignalContext.Provider>
  );
};
