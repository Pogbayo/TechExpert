import React, { createContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { createConnection } from "../../WebSocketC/SignalRConnection";
import type { SignalContextType } from "../../Types/ContextTypes/contextType";
import axiosInstance from "../../IAxios/axiosInstance";

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

  type ConnectionState =
    | "connecting"
    | "connected"
    | "reconnecting"
    | "disconnected";

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionState>("disconnected");

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (!userId) return;

    const initConnection = async () => {
      const newConnection = createConnection(userId);
      connectionRef.current = newConnection;

      setConnectionStatus("connecting");

      try {
        await newConnection.start();

        if (!isMounted.current) return;

        console.log("Connected to SignalR hub.");
        setConnection(newConnection);
        setConnectionStatus("connected");

        newConnection.onreconnected(async () => {
          console.log("SignalR reconnected. Rejoining chat rooms...");
          setConnectionStatus("connected");

          try {
            const token = localStorage.getItem("token");

            const response = await axiosInstance.get<string[]>(
              `/chatrooms/${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const chatRoomIds = response.data;
            for (const roomId of chatRoomIds) {
              await newConnection.invoke("JoinRoom", roomId);
              console.log(`Rejoined chat room: ${roomId}`);
            }
          } catch (error) {
            console.error("Error during reconnection handling:", error);
          }
        });
      } catch (err) {
        console.error("SignalR Connection Error:", err);
        setConnectionStatus("disconnected");
      }
    };

    initConnection();

    return () => {
      isMounted.current = false;

      const stop = async () => {
        if (connectionRef.current) {
          try {
            await connectionRef.current.stop();
            console.log("SignalR connection stopped.");
          } catch (err) {
            console.error("Error stopping SignalR connection", err);
          }
        }

        setConnection(null);
        setConnectionStatus("disconnected");
      };

      stop();
    };
  }, [userId]);

  return (
    <SignalContext.Provider value={{ connection, connectionStatus }}>
      {children}
    </SignalContext.Provider>
  );
};
