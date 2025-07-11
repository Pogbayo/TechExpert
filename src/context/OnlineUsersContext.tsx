import React, { createContext, useContext, useEffect, useState } from "react";
import { useSignal } from "./SignalRContextFolder/useSignalR";

const OnlineUsersContext = createContext<string[]>([]);

export const OnlineUsersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useSignal();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!connection) return;
    connection.on("OnlineUsersChanged", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
    connection.invoke("GetOnlineUsers").then(setOnlineUsers).catch(() => {});
    return () => {
      connection.off("OnlineUsersChanged");
    };
  }, [connection]);

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>
      {children}
    </OnlineUsersContext.Provider>
  );
};

export const useOnlineUsers = () => useContext(OnlineUsersContext); 