import { useEffect, useState, createContext, type ReactNode } from "react";
import * as signalR from "@microsoft/signalr";
import {
  stopConnection,
  createConnection,
  connectionInstance,
} from "../../WebSocketC/SignalRConnection";
import axiosInstance from "../../IAxios/axiosInstance";

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  connected: boolean;
  connectionStatus:
    | "connecting"
    | "connected"
    | "disconnected"
    | "reconnecting";
}

const SignalContext = createContext<SignalRContextType>({
  connection: null,
  connected: false,
  connectionStatus: "disconnected",
});

interface SignalRProviderProps {
  userId: string;
  children: ReactNode;
}

export const SignalProvider = ({ userId, children }: SignalRProviderProps) => {
  const [connected, setConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const [isStarting, setIsStarting] = useState(false);

  const setStateBasedOnConnection = (state: signalR.HubConnectionState) => {
    switch (state) {
      case signalR.HubConnectionState.Connected:
        setConnected(true);
        setConnectionStatus("connected");
        break;
      case signalR.HubConnectionState.Reconnecting:
        setConnected(false);
        setConnectionStatus("reconnecting");
        break;
      case signalR.HubConnectionState.Connecting:
        setConnected(false);
        setConnectionStatus("connecting");
        break;
      default:
        setConnected(false);
        setConnectionStatus("disconnected");
        break;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let connectionAttempts = 0;
    const maxAttempts = 3;

    const startSignalR = async () => {
      if (isStarting || connectionAttempts >= maxAttempts) {
        return;
      }

      setIsStarting(true);
      connectionAttempts++;

      try {
        setConnectionStatus("connecting");
        await stopConnection();
        const connection = createConnection(userId);

        // Event listeners
        connection.onclose(() => {
          console.log("🔌 SignalR connection closed for user:", userId);
          if (isMounted && connectionAttempts < maxAttempts) {
            setConnected(false);
            setConnectionStatus("disconnected");
          }
        });

        connection.onreconnecting(() => {
          console.log("🔄 SignalR reconnecting for user:", userId);
          if (isMounted) {
            setConnected(false);
            setConnectionStatus("reconnecting");
          }
        });

        connection.onreconnected(() => {
          console.log("✅ SignalR reconnected for user:", userId);
          if (isMounted) {
            setStateBasedOnConnection(connection.state);
          }
        });

        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();

          if (isMounted) {
            setConnected(true);
            setConnectionStatus("connected");
          }

          // Join chat rooms silently
          try {
            const token = localStorage.getItem("token");
            const { data: chatRoomIds } = await axiosInstance.get<string[]>(
              `/chatroom/chatroomsids/${userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            console.log("🏠 User", userId, "joining chat rooms:", chatRoomIds);
            for (const roomId of chatRoomIds) {
              await connection.invoke("JoinRoom", roomId);
              console.log("✅ Joined room:", roomId);
            }
          } catch (err) {
            console.log("❌ Failed to join chat rooms:", err);
          }
        } else {
          if (isMounted) {
            setStateBasedOnConnection(connection.state);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.log(err);
          setConnected(false);
          setConnectionStatus("disconnected");
        }
      } finally {
        setIsStarting(false);
      }
    };

    if (userId) {
      startSignalR();
    }

    return () => {
      isMounted = false;
      stopConnection();
      setConnected(false);
      setConnectionStatus("disconnected");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <SignalContext.Provider
      value={{ connection: connectionInstance(), connected, connectionStatus }}
    >
      {children}
    </SignalContext.Provider>
  );
};

export default SignalContext;
