import { useEffect } from "react";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import type { ChatWindowProps } from "../Types/ContextTypes/contextType";
import MessageInput from "./MessageInput";

export default function ChatWindow({ chatRoomId }: ChatWindowProps) {
  const { messagesByChatRoomId } = useMessage();

  useEffect(() => {
    console.log("Fetching messages for chatRoomId:", chatRoomId);
  }, [chatRoomId]);

  return (
    <div>
      <h2>Chat Room: {chatRoomId}</h2>
      <div>
        {messagesByChatRoomId.length > 0 ? (
          messagesByChatRoomId.map((msg, idx) => <p key={idx}>{msg.content}</p>)
        ) : (
          <p>No messages yet...</p>
        )}
      </div>
      <div className="mt-auto">
        <MessageInput chatRoomId={chatRoomId} />
      </div>
    </div>
  );
}
