import { useState } from "react";
import type { MessageInputProps } from "../Types/ContextTypes/contextType";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import { IoSendSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useParams } from "react-router-dom";

export default function MessageInput({
  // chatRoomId,
  isGroup,
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage } = useMessage();
  const { user } = useAuth();
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const handleSend = async () => {
    setMessage("");
    if (message.trim() !== "") {
      await sendMessage(chatRoomId ?? "", user?.id ?? "", message);
      console.log(isGroup);
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
        <IoSendSharp color="white" />
      </button>
    </div>
  );
}
