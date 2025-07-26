import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useTheme } from "../context/ThemeContextFoler/useTheme";
import type { ChatBubbleProps } from "../Types/PropsTypes/props";
import { motion } from "framer-motion";

export default function ChatBubble({
  message,
  senderId,
  timestamp,
}: ChatBubbleProps) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const isSender = senderId === user?.id;

  // const formatTimestamp = (timestamp?: string) => {
  //   if (!timestamp) return "";
  //   const date = new Date(timestamp);
  //   if (isNaN(date.getTime())) return ""; 
  //   return date.toLocaleTimeString("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  return (
    <div className="relative flex w-full">
      {/* Bubble with WhatsApp-like tail */}
      <motion.div
        className={`relative max-w-[80%] sm:max-w-[60%] px-3 py-2 my-1.5 rounded-xl text-sm leading-relaxed shadow-sm flex flex-col ${
          isSender
            ? isDarkMode
              ? "bg-blue-600 text-white ml-auto"
              : "bg-blue-500 text-white ml-auto"
            : isDarkMode
            ? "bg-gray-700 text-white mr-auto"
            : "bg-gray-100 text-gray-900 mr-auto"
        } ${isSender ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={{
          wordBreak: "break-word",
          boxShadow: isDarkMode
            ? "0 2px 6px rgba(0,0,0,0.3)"
            : "0 2px 6px rgba(0,0,0,0.1)",
        }}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        aria-label={isSender ? "Your message" : "Received message"}
      >
        <span className="w-full text-left block mb-5 pr-7 whitespace-pre-line">{message}</span>
        {timestamp && (
          <span
            className={`absolute bottom-2 right-3 text-[11px] font-medium ${
              isSender
                ? isDarkMode
                  ? "text-blue-200"
                  : "text-blue-100"
                : isDarkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
            style={{ lineHeight: 1, pointerEvents: "none" }}
          >
            {new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {/* WhatsApp-like bubble tail */}
        <span
          className={`absolute bottom-0 ${isSender ? "right-[-6px]" : "left-[-6px]"} w-2 h-2" style={{ pointerEvents: 'none' }}`}
        >
          <svg viewBox="0 0 8 8" width="8" height="8" className="block">
            <polygon
              points={isSender ? "0,8 8,8 8,0" : "8,8 0,8 0,0"}
              fill={isSender
                ? isDarkMode
                  ? "#2563eb"
                  : "#3b82f6"
                : isDarkMode
                ? "#374151"
                : "#f3f4f6"
              }
            />
          </svg>
        </span>
      </motion.div>
    </div>
  );
}
