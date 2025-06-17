import type { ChatBubbleProps } from "../Types/chat";

export default function ChatBubble({ message, senderId }: ChatBubbleProps) {
  return (
    <div
      className={`max-w-xs p-3 my-2 rounded-lg ${
        senderId
          ? "bg-[var(--color-primary)] text-white self-end"
          : "bg-[var(--color-chat-bg)] text-[var(--color-chat-text)] self-start"
      }`}
    >
      {message}
    </div>
  );
}
