import { useState } from "react";
import type { MessageInputProps } from "../Types/ContextTypes/contextType";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import { IoSendSharp } from "react-icons/io5";

export default function MessageInput({ chatRoomId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage } = useMessage();

  const handleSend = async () => {
    if (message.trim() !== "") {
      await sendMessage(chatRoomId, message, true);
      setMessage("");
    }
  };

  return (
    <div className="flex">
      <input
        className="flex-1 border p-2 rounded-l"
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button
        className="bg-blue-500 text-white p-2 rounded-r"
        onClick={handleSend}
      >
        <IoSendSharp />
      </button>
    </div>
  );
}
