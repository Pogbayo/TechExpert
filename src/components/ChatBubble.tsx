import { useAuth } from "../context/AuthContextFolder/useAuth";
import type { ChatBubbleProps } from "../Types/PropsTypes/props";

export default function ChatBubble({ message, senderId }: ChatBubbleProps) {
  const { user } = useAuth();
  return (
    <div
      className={`max-w-xs p-3 my-2 rounded-lg ${
        senderId == user?.id
          ? "bg-blue-500 text-white self-end ml-auto"
          : "bg-gray-600 text-white self-start mr-auto"
      }`}
    >
      {message}
    </div>
  );
}
