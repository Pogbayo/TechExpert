import React, { createContext, useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import type { SignalContextType } from "../../Types/ContextTypes/contextType";
import axiosInstance from "../../IAxios/axiosInstance";
import { createConnection } from "../../WebSocketC/SignalRConnection";

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
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    // ✅ Abort early if no valid userId (empty or undefined)
    if (!userId || userId.trim() === "") {
      console.log("🕓 No userId available. Skipping SignalR connection.");
      return;
    }

    const newConnection = createConnection(userId);
    connectionRef.current = newConnection;
    setConnectionStatus("connecting");

    const startConnection = async () => {
      try {
        if (newConnection.state !== signalR.HubConnectionState.Disconnected) {
          console.warn(
            "🚫 Cannot start connection: not in 'Disconnected' state."
          );
          return;
        }

        await newConnection.start();

        if (!isMounted.current || cancelled) {
          await newConnection.stop();
          return;
        }

        console.log("✅ Connected to SignalR hub.");
        setConnection(newConnection);
        setConnectionStatus("connected");

        newConnection.onreconnected(async () => {
          console.log("🔄 Reconnected, rejoining rooms...");

          try {
            const token = localStorage.getItem("token");
            const response = await axiosInstance.get<string[]>(
              `/chatrooms/${userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            for (const roomId of response.data) {
              await newConnection.invoke("JoinRoom", roomId);
              console.log(`📢 Rejoined chat room: ${roomId}`);
            }
          } catch (error) {
            console.error("⚠️ Reconnection error:", error);
          }
        });
      } catch (error) {
        console.error("❌ SignalR Connection Error:", error);
        setConnectionStatus("disconnected");
      }
    };

    startConnection();

    return () => {
      cancelled = true;
      isMounted.current = false;

      if (connectionRef.current) {
        connectionRef.current
          .stop()
          .then(() => {
            console.log("🛑 SignalR connection stopped");
            setConnection(null);
            setConnectionStatus("disconnected");
          })
          .catch((err) =>
            console.error("Error stopping SignalR connection", err)
          );
      }
    };
  }, [userId]);

  return (
    <SignalContext.Provider value={{ connection, connectionStatus }}>
      {children}
    </SignalContext.Provider>
  );
};
