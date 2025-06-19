import { useEffect, useRef } from "react";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import type { ChatWindowProps } from "../Types/ContextTypes/contextType";
import MessageInput from "./MessageInput";

export default function ChatWindow({ chatRoomId }: ChatWindowProps) {
  const { messagesByChatRoomId, fetchMessagesByChatRoomId } = useMessage();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFetchMessages = async () => {
      await fetchMessagesByChatRoomId(chatRoomId);
    };
    handleFetchMessages();
  }, [chatRoomId, fetchMessagesByChatRoomId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesByChatRoomId]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Chat Room: {chatRoomId}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messagesByChatRoomId.length > 0 ? (
          messagesByChatRoomId.map((msg, idx) => (
            <p key={idx} className="bg-white p-2 rounded shadow">
              {msg.content}
            </p>
          ))
        ) : (
          <p className="m-auto text-gray-500">No messages yet...</p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4 bg-white">
        <MessageInput chatRoomId={chatRoomId} />
      </div>
    </div>
  );
}
