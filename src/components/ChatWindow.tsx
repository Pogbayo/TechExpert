import { useEffect, useRef, useState } from "react";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import type { ChatWindowProps } from "../Types/ContextTypes/contextType";
import MessageInput from "./MessageInput";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import ChatBubble from "./ChatBubble";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatWindow({ chatRoomId }: ChatWindowProps) {
  const {
    messagesByChatRoomId,
    fetchMessagesByChatRoomId,
    deleteMessage,
    editMessage,
  } = useMessage();
  const { getChatRoomById, chatRoom } = useChatRoom();
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const handleFetchMessages = async () => {
      await fetchMessagesByChatRoomId(chatRoomId);
    };
    handleFetchMessages();
  }, [chatRoomId, fetchMessagesByChatRoomId]);

  useEffect(() => {
    const handleFetchChatRoomById = async () => {
      await getChatRoomById(chatRoomId);
    };
    handleFetchChatRoomById();
  }, [chatRoomId, getChatRoomById]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesByChatRoomId]);

  const extractChatRoomName = (chatRoom: ChatRoomType | null) => {
    if (chatRoom?.isGroup) {
      return chatRoom.name;
    } else {
      const otherUser = chatRoom?.users.find((u) => u.id !== user?.id);
      return otherUser ? otherUser.username.slice(0, 5) : "";
    }
  };

  const handleDelete = async (messageId: string) => {
    await deleteMessage(messageId);
    setSelectedMessageId(null);
  };

  const handleEdit = async (messageId: string, newContent: string) => {
    if (editText.trim() === "") return;
    await editMessage(messageId, newContent);
    setEditingMessageId(null);
    setSelectedMessageId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-gray-100 flex items-center justify-center">
        <h2 className="text-2xl font-extrabold text-black-700 uppercase tracking-wide">
          {extractChatRoomName(chatRoom)}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messagesByChatRoomId.length > 0 ? (
          messagesByChatRoomId.map((msg, idx) => (
            <div key={idx} className="relative group">
              {/* Editable Mode */}
              {editingMessageId === msg.messageId ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="border p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <button
                    onClick={() => handleEdit(msg.messageId, editText)}
                    className="text-blue-500 font-semibold hover:underline"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingMessageId(null)}
                    className="text-red-500 font-semibold hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => {
                    // Only allow selecting own messages
                    if (msg.senderId === user?.id) {
                      setSelectedMessageId(
                        selectedMessageId === msg.messageId
                          ? null
                          : msg.messageId
                      );
                    }
                  }}
                  className={`${
                    msg.senderId === user?.id
                      ? "cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  <ChatBubble senderId={msg.senderId} message={msg.content} />
                </div>
              )}

              <AnimatePresence>
                {selectedMessageId === msg.messageId &&
                  msg.senderId === user?.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.1 }}
                      className="mt-2 bg-white border border-gray-200 rounded-lg shadow p-2 flex flex-col space-y-1 z-10 overflow-hidden"
                    >
                      <button
                        onClick={() => {
                          setEditingMessageId(msg.messageId);
                          setEditText(msg.content);
                        }}
                        className="text-sm px-3 py-1 rounded hover:bg-blue-100 hover:text-blue-600 transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(msg.messageId)}
                        className="text-sm px-3 py-1 rounded hover:bg-red-100 hover:text-red-600 transition"
                      >
                        🗑️ Delete
                      </button>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          ))
        ) : (
          <p className="m-auto text-gray-500">
            {messagesByChatRoomId
              ? "Send a message to begin conversation..."
              : "Loading messages..."}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t p-4 bg-white">
        <MessageInput chatRoomId={chatRoomId} />
      </div>
    </div>
  );
}
