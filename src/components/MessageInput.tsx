import { useState } from "react";
import type { MessageInputProps } from "../Types/ContextTypes/contextType";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import { IoSendSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";
import toast from "react-hot-toast";
import { useRef } from "react";
// import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";

export default function MessageInput({ isGroup }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage, currentChatRoomId } = useMessage();
  const { user } = useAuth();
  // const { currentChatRoomId } = useChatRoom(); // Remove this line
  const { connection } = useSignal();
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  void isGroup;
  const handleSend = async () => {
    if (connection?.state !== "Connected") {
      toast.error("Error: Not connected to the chat server.");
      return;
    }
    if (!currentChatRoomId) {
      toast.error("No chat room selected.");
      return;
    }
    if (message.trim() === "") return;
    setLoading(true);
    await sendMessage(currentChatRoomId, user?.id ?? "", message);
    setMessage("");
    setLoading(false);
    // Auto resize after send
    if (textareaRef.current) textareaRef.current.style.height = '40px';
  };

  // Auto-expand textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = '40px';
    el.style.height = el.scrollHeight + 'px';
    setMessage(el.value);
  };

  return (
    <div className="flex w-full">
      <textarea
        ref={textareaRef}
        className="flex-1 border p-2 rounded-l resize-none min-h-[40px] max-h-40 overflow-hidden"
        value={message}
        onChange={handleInput}
        placeholder="Type your message..."
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
        style={{
          height: '40px',
          fontSize: '16px' // Prevent iOS zoom
        }}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-r cursor-pointer min-w-[40px] flex items-center justify-center"
        onClick={handleSend}
        disabled={loading}
      >
        {loading ? (
          <span className="loader-dots">
            <span></span><span></span><span></span>
          </span>
        ) : (
          <IoSendSharp color="white" />
        )}
      </button>
      <style>{`
        .loader-dots {
          display: inline-block;
          width: 24px;
          height: 16px;
          text-align: center;
        }
        .loader-dots span {
          display: inline-block;
          width: 6px;
          height: 6px;
          margin: 0 1px;
          background: #fff;
          border-radius: 50%;
          animation: loader-dots-bounce 1.2s infinite ease-in-out both;
        }
        .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loader-dots span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes loader-dots-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
