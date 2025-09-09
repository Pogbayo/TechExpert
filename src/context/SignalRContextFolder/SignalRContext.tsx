import { useEffect, useState, createContext, type ReactNode, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import {
  stopConnection,
  createConnection,
  connectionInstance,
} from "../../WebSocketC/SignalRConnection";
import axiosInstance from "../../IAxios/axiosInstance";
// import { useAuth } from "../AuthContextFolder/useAuth";

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
  // const { user } = useAuth();
  const isMounted = useRef(true);

  const setStateBasedOnConnection = (state: signalR.HubConnectionState) => {
    if (!isMounted.current) return;
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
    isMounted.current = true;
    let connectionAttempts = 0;
    const maxAttempts = 3;

    const startSignalR = async () => {
      if (isStarting || connectionAttempts >= maxAttempts || !isMounted.current) {
        console.log("Skipping SignalR start: isStarting, max attempts, or unmounted");
        return;
      }

      const token = localStorage.getItem("token");
      if (!userId || !token) {
        console.log("No userId or token, stopping SignalR connection");
        await stopConnection();
        if (isMounted.current) {
          setConnected(false);
          setConnectionStatus("disconnected");
          setIsStarting(false);
        }
        return;
      }

      console.log("Starting SignalR with userId:", !!userId, "token:", !!token);
      setIsStarting(true);
      connectionAttempts++;

      try {
        setConnectionStatus("connecting");
        await stopConnection(); // Ensure any existing connection is stopped
        const connection = createConnection(userId);

        // Event listeners
        connection.onclose(() => {
          if (isMounted.current && connectionAttempts < maxAttempts) {
            console.log("SignalR connection closed");
            setConnected(false);
            setConnectionStatus("disconnected");
          }
        });

        connection.onreconnecting(() => {
          if (isMounted.current) {
            console.log("SignalR reconnecting");
            setConnected(false);
            setConnectionStatus("reconnecting");
          }
        });

        connection.onreconnected(() => {
          if (isMounted.current) {
            console.log("SignalR reconnected");
            setStateBasedOnConnection(connection.state);
          }
        });

        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
          console.log("SignalR connection started");

          if (isMounted.current) {
            setConnected(true);
            setConnectionStatus("connected");
          }

          // Join chat rooms silently
          try {
            const { data: chatRoomIds } = await axiosInstance.get<string[]>(
              `/chatroom/chatroomsids/${userId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            for (const roomId of chatRoomIds) {
              await connection.invoke("JoinRoom", roomId);
            }
          } catch (err) {
            console.log("❌ Failed to join chat rooms:", err);
          }
        } else {
          if (isMounted.current) {
            setStateBasedOnConnection(connection.state);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("SignalR connection error:", err);
          setConnected(false);
          setConnectionStatus("disconnected");
        }
      } finally {
        if (isMounted.current) {
          setIsStarting(false);
        }
      }
    };

    if (userId && localStorage.getItem("token")) {
      startSignalR();
    } else {
      console.log("Stopping SignalR due to missing userId or token");
      stopConnection().catch((err) => console.error("Failed to stop SignalR connection:", err));
    }

    return () => {
      isMounted.current = false;
      stopConnection().catch((err) => console.error("Failed to stop SignalR connection:", err));
    };
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