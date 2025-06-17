import { useContext } from "react";
import { ChatRoomUserContext } from "./ChatRoomUserContext";

export function useUser() {
  const context = useContext(ChatRoomUserContext);

  if (context === undefined) {
    throw new Error("useMessage must be used within a ChatRoomUserProvider");
  }

  return context;
}
