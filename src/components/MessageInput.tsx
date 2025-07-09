import { useState } from "react";
import type { MessageInputProps } from "../Types/ContextTypes/contextType";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import { IoSendSharp } from "react-icons/io5";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useParams } from "react-router-dom";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";
import toast from "react-hot-toast";

export default function MessageInput({ isGroup }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { sendMessage } = useMessage();
  const { user } = useAuth();
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { connection } = useSignal();

  const handleSend = async () => {
    if (connection?.state !== "Connected") {
      toast.error("Error: Not connected to the chat server.");
      return;
    }

    if (message.trim() === "") return;
    console.group(isGroup);

    await sendMessage(chatRoomId ?? "", user?.id ?? "", message);
    setMessage("");
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
        className="bg-blue-500 text-white p-2 rounded-r cursor-pointer"
        onClick={handleSend}
      >
        <IoSendSharp color="white" />
      </button>
    </div>
  );
}
