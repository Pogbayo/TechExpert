import type { ChatMessageListProps } from "../Types/chat";
import ChatBubble from "./ChatBubble";

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <div
      className="flex flex-col overflow-y-auto p-4 space-y-2 flex-grow"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          message={msg.content}
          senderId={msg.senderId}
        />
      ))}
    </div>
  );
}
