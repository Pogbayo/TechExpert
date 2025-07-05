import { useEffect, useRef, useState } from "react";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import type { ChatWindowProps } from "../Types/ContextTypes/contextType";
import MessageInput from "./MessageInput";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import ChatBubble from "./ChatBubble";
import { motion, AnimatePresence } from "framer-motion";
import { addHours, format, isToday, isYesterday } from "date-fns";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";

export default function ChatWindow({ chatRoom }: ChatWindowProps) {
  const {
    messagesByChatRoomId,
    deleteMessage,
    editMessage,
    fetchMessagesByChatRoomId,
    setCurrentChatRoomId,
    setmessagesByChatRoomId,
  } = useMessage();

  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const navigate = useNavigate();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  let lastRenderedDate = "";

  // Get connection status from SignalContext
  const { connectionStatus } = useSignal();

  useEffect(() => {
    setCurrentChatRoomId(chatRoom.chatRoomId);
  }, [chatRoom.chatRoomId, setCurrentChatRoomId]);

  useEffect(() => {
    const handleFetchMessages = async () => {
      await fetchMessagesByChatRoomId(chatRoom.chatRoomId);
    };
    handleFetchMessages();
  }, [chatRoom.chatRoomId, fetchMessagesByChatRoomId]);

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
      return otherUser ? otherUser.username : "";
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

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM dd, yyyy");
  };

  const navigateToChatRoute = () => {
    navigate("/chat");
    setmessagesByChatRoomId({});
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  // Spinner component
  const Spinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-gray-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );

  const renderConnectionStatus = () => {
    if (connectionStatus === "connected") {
      return extractChatRoomName(chatRoom);
    }

    const statusMap: Record<string, string> = {
      connecting: "Connecting...",
      reconnecting: "Reconnecting...",
      disconnected: "Disconnected",
    };

    const isLoading =
      connectionStatus === "connecting" || connectionStatus === "reconnecting";

    return (
      <div
        className={`flex items-center space-x-2 ${
          connectionStatus === "disconnected" ? "text-red-600" : ""
        }`}
      >
        <span>{statusMap[connectionStatus]}</span>
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Spinner />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const currentMessages = messagesByChatRoomId[chatRoom.chatRoomId];
  const hasMessages =
    Array.isArray(currentMessages) && currentMessages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="p-4 border-b bg-gray-100 flex items-center justify-between relative">
        {/* Back Button (Mobile Only) */}
        <button
          onClick={() => {
            fetchMessagesByChatRoomId(chatRoom.chatRoomId);
            navigateToChatRoute();
          }}
          className="cursor-pointer block md:hidden"
        >
          <FaArrowLeft />
        </button>

        {/* Connection status or Chat Room Name */}
        <h2 className="font-extrabold text-black-700 uppercase tracking-wide text-[clamp(1rem, 4vw, 1.5rem)] text-center flex-1 flex items-center justify-center">
          {renderConnectionStatus()}
        </h2>

        {/* Profile Section */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={handleViewProfile}
        >
          <FaUserCircle />
          <span className="text-gray-600 text-sm font-medium hidden sm:block">
            {user?.username}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {hasMessages ? (
          currentMessages!
            .sort(
              (a, b) =>
                new Date(a.timestamp ?? "").getTime() -
                new Date(b.timestamp ?? "").getTime()
            )
            .map((msg, idx) => {
              const messageTime = addHours(new Date(msg.timestamp ?? ""), 1);
              const messageDate = formatDateHeader(messageTime.toISOString());
              const showDateHeader = messageDate !== lastRenderedDate;
              lastRenderedDate = messageDate;

              const isSender = msg.sender?.id === user?.id;

              return (
                <div key={idx} className="relative group">
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded-full">
                        {messageDate}
                      </span>
                    </div>
                  )}

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
                        if (isSender) {
                          setSelectedMessageId(
                            selectedMessageId === msg.messageId
                              ? null
                              : msg.messageId
                          );
                        }
                      }}
                      className={`flex flex-col ${
                        isSender ? "items-end" : "items-start"
                      } ${isSender ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <small>
                        {chatRoom.isGroup ? (
                          <i>
                            {msg.sender?.id === user?.id
                              ? ""
                              : msg.sender?.username}
                          </i>
                        ) : (
                          ""
                        )}
                      </small>
                      <ChatBubble
                        senderId={msg.sender?.id ?? ""}
                        message={msg.content}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {messageTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  )}

                  <AnimatePresence>
                    {selectedMessageId === msg.messageId && isSender && (
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
              );
            })
        ) : (
          <p className="m-auto text-gray-500">
            {messagesByChatRoomId
              ? "Send a message to begin conversation..."
              : "Loading messages..."}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white">
        <MessageInput isGroup={chatRoom?.isGroup ?? false} />
      </div>
    </div>
  );
}
