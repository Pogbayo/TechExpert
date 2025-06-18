import { useContext } from "react";
import { ChatRoomContext } from "./ChatRoomContext";

export function useChatRoom() {
  const context = useContext(ChatRoomContext);
  
  if (!context) {
    throw new Error("useChatRoomContext must be used within a ChatRoomProvider");
  }

  return context;
}
