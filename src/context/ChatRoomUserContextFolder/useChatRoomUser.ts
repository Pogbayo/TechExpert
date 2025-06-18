import { useContext } from "react";
import { ChatRoomUserContext } from "./ChatRoomUserContext";

export function useChatRoomUser() {
  const context = useContext(ChatRoomUserContext);

  if (context === undefined) {
    throw new Error("useChatRoomUserContext must be used within a ChatRoomUserProvider");
  }

  return context;
}
