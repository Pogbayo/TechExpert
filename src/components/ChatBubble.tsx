import { useAuth } from "../context/AuthContextFolder/useAuth";
import type { ChatBubbleProps } from "../Types/PropsTypes/props";

export default function ChatBubble({ message, senderId, timestamp }: ChatBubbleProps) {
  const { user } = useAuth();
  const isSender = senderId === user?.id;
  return (
    <div
      className={`relative max-w-xs md:max-w-sm px-4 py-2 my-1 rounded-xl text-[14px] leading-snug shadow-md flex flex-col
        ${isSender ? "bg-[#0084ff] text-white self-end ml-auto items-start" : "bg-[#f0f0f0] text-gray-900 self-start mr-auto items-end"}
      `}
      style={{ wordBreak: "break-word", boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      <span className="w-full mb-3 text-left">{message}</span>
      {timestamp && (
        <span
          className={`absolute mt-1 ${isSender ? "right-2 bottom-1" : "left-2 bottom-1"} text-[8px] font-semibold ${isSender ? "text-[#b3e0ff]" : "text-gray-600"} dark:${isSender ? "text-blue-200" : "text-blue-300"}`}
          style={{lineHeight:1, pointerEvents: 'none'}}
        >
          {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  );
}
