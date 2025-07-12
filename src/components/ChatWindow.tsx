import { useEffect, useRef, useState } from "react";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import type { ChatWindowProps } from "../Types/ContextTypes/contextType";
import MessageInput from "./MessageInput";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import ChatBubble from "./ChatBubble";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { FaArrowLeft } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";
import * as signalR from "@microsoft/signalr";

interface ChatWindowPropsExtended extends ChatWindowProps {
  isMobileView: boolean;
  selectedChatRoomId: string | null;
  chatRoom: ChatRoomType | null;
  setShowChatWindow: (val: boolean) => void;
}

export default function ChatWindow({
  chatRoom,
  isMobileView,
  setShowChatWindow,
}: // selectedChatRoomId,
ChatWindowPropsExtended) {
  const {
    messagesByChatRoomId,
    deleteMessage,
    editMessage,
    fetchMessagesByChatRoomId,
    setCurrentChatRoomId,
    // setmessagesByChatRoomId,
  } = useMessage();
  // console.log(typeof selectedChatRoomId)
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  // const navigate = useNavigate();
  let lastRenderedDate = "";
  const [showOtherProfile, setShowOtherProfile] = useState(false);
  // const [showSelfProfile, setShowSelfProfile] = useState(false);

  const { connection } = useSignal();
  const connectionStatus = connection?.state;

  useEffect(() => {
    if (chatRoom) setCurrentChatRoomId(chatRoom.chatRoomId);
  }, [chatRoom, setCurrentChatRoomId]);

  useEffect(() => {
    if (chatRoom) fetchMessagesByChatRoomId(chatRoom.chatRoomId);
  }, [chatRoom, fetchMessagesByChatRoomId]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesByChatRoomId]);

  if (!chatRoom) {
    return (
      <div className="flex flex-1 items-center justify-center h-full w-full text-center bg-[var(--color-background)]">
        <div className="p-12 rounded-2xl shadow-2xl bg-gray-100 dark:bg-[var(--color-chat-bg)] border border-[var(--color-border)] flex flex-col items-center max-w-xl w-full">
          <img
            src="https://api.iconify.design/mdi:chat-outline.svg?color=white"
            alt="Spag Chat Logo"
            className="w-28 h-28 mb-6 mx-auto drop-shadow-lg"
          />
          <h2 className="font-extrabold text-3xl mb-3 text-blue-600 dark:text-blue-300">
            Spag Chat for Windows
          </h2>
          <p className="text-lg opacity-80 mb-2 font-medium">
            Fast, simple, and secure messaging for everyone.
          </p>
          <p className="text-base opacity-60">
            Select a chat room to start your conversation.
          </p>
        </div>
      </div>
    );
  }

  const extractChatRoomName = (chatRoom: ChatRoomType | null) => {
    if (chatRoom?.isGroup) return chatRoom.name;
    const otherUser = chatRoom?.users.find((u) => u.id !== user?.id);
    return otherUser ? otherUser.username : "";
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

  // const handleViewProfile = () => {
  //   navigate("/profile");
  // };

  const Spinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-[var(--color-text)]"
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
    if (!isMobileView) {
      // On desktop: just show chat room name
      return extractChatRoomName(chatRoom);
    }

    // On mobile: show connection status or chat room name
    if (connectionStatus === signalR.HubConnectionState.Connected) {
      return extractChatRoomName(chatRoom);
    }

    const statusMap: Record<string, string> = {
      [signalR.HubConnectionState.Connecting]: "Connecting...",
      [signalR.HubConnectionState.Reconnecting]: "Reconnecting...",
      [signalR.HubConnectionState.Disconnected]: "Disconnected",
    };

    const isLoading =
      connectionStatus === signalR.HubConnectionState.Connecting ||
      connectionStatus === signalR.HubConnectionState.Reconnecting;

    return (
      <div
        className={`flex items-center space-x-2 ${
          connectionStatus === signalR.HubConnectionState.Disconnected
            ? "text-red-600"
            : "text-[var(--color-text)]"
        }`}
      >
        <span>{statusMap[connectionStatus ?? ""]}</span>
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

  const otherUser = !chatRoom.isGroup
    ? chatRoom.users.find((u) => u.id !== user?.id)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="p-4 border-b bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text)] flex flex-col relative">
        <div className="flex items-center w-full">
          {isMobileView && (
            <button
              onClick={() => {
                setShowChatWindow(false);
                // setmessagesByChatRoomId({});
              }}
              className="cursor-pointer block md:hidden"
              aria-label="Back to chat list"
              title="Back to chat list"
            >
              <FaArrowLeft />
            </button>
          )}

          {/* fallback Text if no chat has been selected
          {!selectedChatRoomId && (
            <div
              style={{
                color: "black",
              }}
            >
              Select a chat to begin conversation
            </div>
          )} */}

          {/* DM: Only show other user's avatar and name ONCE */}
          {!chatRoom.isGroup && otherUser && (
            <div
              className="flex items-center gap-3 mx-auto cursor-pointer"
              onClick={() => setShowOtherProfile(true)}
              title="View profile"
            >
              <img
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                  otherUser.username || "user"
                )}`}
                alt="user avatar"
                className="w-10 h-10 rounded-full bg-gray-200 object-cover"
              />
              <span className="text-[var(--color-text)] text-base font-bold">
                {otherUser.username}
              </span>
            </div>
          )}

          {/* Group: Keep group name and avatars row*/}
          {chatRoom.isGroup && (
            <h2 className="font-extrabold uppercase tracking-wide text-[clamp(1rem, 4vw, 1.5rem)] text-center flex-1 flex items-center justify-center">
              {renderConnectionStatus()}
            </h2>
          )}
        </div>

        {/* Group avatars row */}
        {chatRoom.isGroup && (
          <div className="flex items-center justify-center mt-2 mb-1">
            {chatRoom.users.slice(0, 4).map((u, idx) => (
              <img
                key={u.id}
                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                  u.username
                )}`}
                alt={u.username}
                className="w-5 h-5 rounded-full border-2 border-white -ml-2 first:ml-0 bg-gray-200 object-cover shadow"
                style={{ zIndex: 10 - idx }}
              />
            ))}
            {chatRoom.users.length > 4 && (
              <span className="ml-2 text-xs bg-[var(--color-border)] text-[var(--color-text)] px-2 py-1 rounded-full border border-[var(--color-border)]">
                +{chatRoom.users.length - 4} others
              </span>
            )}
          </div>
        )}
      </div>

      {/* Other User Profile Modal */}
      {showOtherProfile && otherUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-2xl p-8 w-full max-w-xs flex flex-col items-center relative">
            <button
              className="absolute top-2 right-2 text-xl"
              onClick={() => setShowOtherProfile(false)}
            >
              &times;
            </button>
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                otherUser.username
              )}`}
              alt="user avatar"
              className="w-24 h-24 rounded-full shadow mb-4 bg-gray-200 object-cover"
            />
            <h2 className="text-lg font-bold mb-2">{otherUser.username}</h2>
            {otherUser.email && (
              <p className="text-gray-500 mb-2">{otherUser.email}</p>
            )}
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--color-background)] text-[var(--color-text)] scrollbar-hide">
        {hasMessages ? (
          currentMessages!
            .sort(
              (a, b) =>
                new Date(a.timestamp ?? "").getTime() -
                new Date(b.timestamp ?? "").getTime()
            )
            .map((msg, idx) => {
              const messageTime = new Date(msg.timestamp ?? "");
              const messageDate = formatDateHeader(messageTime.toISOString());
              const showDateHeader = messageDate !== lastRenderedDate;
              lastRenderedDate = messageDate;

              const isSender = msg.sender?.id === user?.id;

              return (
                <div key={idx} className="relative group">
                  {showDateHeader && (
                    <div className="flex justify-center my-4">
                      <span className="bg-[var(--color-border)] text-[var(--color-text)] text-xs px-3 py-1 rounded-full">
                        {messageDate}
                      </span>
                    </div>
                  )}

                  {editingMessageId === msg.messageId ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="border border-[var(--color-border)] bg-[var(--color-input-bg)] text-[var(--color-input-text)] p-2 rounded flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <button
                        onClick={() => handleEdit(msg.messageId, editText)}
                        className="text-blue-500 font-semibold hover:underline dark:text-blue-200"
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
                      className={`flex flex-col group ${
                        isSender ? "items-end" : "items-start"
                      } ${isSender ? "cursor-pointer" : "cursor-default"} mb-1`}
                    >
                      {chatRoom.isGroup && msg.sender?.id !== user?.id && (
                        <span className="text-[10px] text-gray-400 mb-0.5 ml-1">
                          {msg.sender?.username}
                        </span>
                      )}
                      <ChatBubble
                        senderId={msg.sender?.id ?? ""}
                        message={msg.content}
                        timestamp={msg.timestamp}
                      />
                    </div>
                  )}

                  <AnimatePresence>
                    {selectedMessageId === msg.messageId && isSender && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.1 }}
                        className="mt-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg shadow p-2 flex flex-col space-y-1 z-10 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.messageId);
                            setEditText(msg.content);
                          }}
                          className="text-sm px-3 py-1 rounded hover:bg-blue-100 hover:text-blue-600 transition dark:hover:text-blue-200"
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
          <p className="m-auto text-[var(--color-text)] opacity-60">
            {messagesByChatRoomId
              ? "Send a message to begin conversation..."
              : "Loading messages..."}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-background)]">
        <MessageInput isGroup={chatRoom?.isGroup ?? false} />
      </div>
    </div>
  );
}
