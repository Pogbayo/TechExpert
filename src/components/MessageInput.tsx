import { useState, useRef } from "react";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { IoSendSharp } from "react-icons/io5";
import { FaPaperclip } from "react-icons/fa";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import type { MessageInputProps } from "../Types/ContextTypes/contextType";
import { useTheme } from "../context/ThemeContextFoler/useTheme";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";

export default function MessageInput({ isGroup }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage, currentChatRoomId } = useMessage();
  const { user } = useAuth();
  const { connection } = useSignal();
  const { isDarkMode } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    setMessage("");
    if (connection?.state !== "Connected") {
      toast.error("Not connected to the chat server.");
      return;
    }
    if (!currentChatRoomId) {
      toast.error("No chat room selected.");
      return;
    }
    if (message.trim() === "") return;

    try {
      await sendMessage(currentChatRoomId, user?.id ?? "", message);
      if (textareaRef.current) textareaRef.current.style.height = "48px"; // Reset height
    } catch {
      toast.error("Failed to send message.");
    }
  };

  void isGroup;

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = "48px";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
    setMessage(el.value);
  };

  return (
    <div
      className={`flex items-center rounded-full shadow-md p-2 mx-2 transition-all duration-200 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{ maxWidth: "98%" }}
    >
      <motion.button
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-full transition-colors ${
          isDarkMode
            ? "text-gray-400 hover:text-blue-400"
            : "text-gray-500 hover:text-blue-500"
        }`}
        title="Attach file (coming soon)"
        disabled
      >
        <FaPaperclip size={20} />
      </motion.button>
      <textarea
        ref={textareaRef}
        className={`flex-1 bg-transparent resize-none min-h-[48px] max-h-[128px] px-3 py-2.5 focus:outline-none text-sm ${
          isDarkMode
            ? "text-white placeholder-gray-500"
            : "text-gray-900 placeholder-gray-400"
        }`}
        value={message}
        onChange={handleInput}
        placeholder="Type a message..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        style={{ fontSize: "16px" }}
        aria-label="Message input"
      />
      <motion.button
        className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${
          !message.trim()
            ? isDarkMode
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gray-300 cursor-not-allowed"
            : isDarkMode
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
        onClick={handleSend}
        disabled={!message.trim()}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        title="Send message"
      >
        <IoSendSharp size={20} />
      </motion.button>
    </div>
  );
}
