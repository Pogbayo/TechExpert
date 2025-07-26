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
import { HiMenu } from "react-icons/hi";
// import { useNavigate } from "react-router-dom";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";
import * as signalR from "@microsoft/signalr";
import { useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useTheme } from "../context/ThemeContextFoler/useTheme";
import { useOnlineUsers } from "../context/OnlineUsersContext";

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  // const navigate = useNavigate();
  let lastRenderedDate = "";
  const [showOtherProfile, setShowOtherProfile] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  // const [showSelfProfile, setShowSelfProfile] = useState(false);
  const navigate = useNavigate();
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (isMobileView) {
        setShowChatWindow(false);
      } else {
        navigate(-1);
      }
    },
    delta: 50,
    trackTouch: true, // Ensure touch tracking is enabled
    swipeDuration: 500, // Maximum time for swipe
  });

  const onlineUsers = useOnlineUsers()
  console.log(onlineUsers);
  const { connection } = useSignal();
  const connectionStatus = connection?.state;
  const { markAsRead, unreadCount, setUnreadCount } = useChatRoom();
  const { isDarkMode } = useTheme();

  // Mobile keyboard handling - scroll chat to bottom when input is focused
  useEffect(() => {
    if (!isMobileView) return;

    const handleInputFocus = () => {
      // Wait for keyboard animation to complete
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    };

    // Listen for focus events on the message input
    const messageInput = document.getElementById('message-input');
    if (messageInput) {
      messageInput.addEventListener('focus', handleInputFocus);
      return () => {
        messageInput.removeEventListener('focus', handleInputFocus);
      };
    }
  }, [isMobileView, messagesByChatRoomId]);

  // Handle viewport height changes on mobile (keyboard appearance)
  useEffect(() => {
    if (!isMobileView) return;

    const handleResize = () => {
      // Update the chat container height to account for keyboard
      if (chatContainerRef.current) {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      }
    };

    // Set initial viewport height
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isMobileView]);

  useEffect(() => {
    if (!chatRoom?.chatRoomId) {
      setCurrentChatRoomId(chatRoom?.chatRoomId ?? "");
    }
  }, [chatRoom?.chatRoomId, setCurrentChatRoomId]);

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

  useEffect(() => {
    if (!chatRoom?.chatRoomId || !user?.id) return;
    const roomId = chatRoom.chatRoomId;
    const unread = unreadCount[roomId] || 0;
    if (unread > 0 && messagesByChatRoomId[roomId]) {
      // Get messages not sent by the logged-in user
      const messages = messagesByChatRoomId[roomId]!.filter(
        (msg) => msg.sender?.id !== user.id
      );
      // Get the last 'unread' messages (nth last)
      const lastUnreadMessages = messages.slice(-unread);
      const messageIds = lastUnreadMessages.map((msg) => msg.messageId);
      if (messageIds.length > 0) {
        markAsRead(messageIds, user.id);
        setUnreadCount((prev) => ({ ...prev, [roomId]: 0 }));
      }
    }
  }, [chatRoom, messagesByChatRoomId, user?.id]);

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
      return extractChatRoomName(chatRoom);
    }

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

  // Avatar fallback component
  // const AvatarFallback = ({ username, size = 40 }: { username?: string, size?: number }) => (
  //   <div
  //     style={{
  //       width: size,
  //       height: size,
  //       borderRadius: '50%',
  //       background: '#e0e0e0',
  //       display: 'flex',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       fontWeight: 'bold',
  //       fontSize: size * 0.45,
  //       color: '#888',
  //     }}
  //     aria-label={username || 'user'}
  //   >
  //     {username ? username.charAt(0).toUpperCase() : '?'}
  //   </div>
  // );

  const groupPanelTextClass = isDarkMode ? 'text-gray-300' : 'text-gray-900';
  const groupPanelHoverClass = isDarkMode ? '' : 'hover:bg-gray-50';

  return (
    <div {...handlers} className="flex flex-col h-full w-full">
      {/* Top Bar (Header) */}
      <div className="p-4 border-b bg-[var(--color-background)] border-[var(--color-border)] text-[var(--color-text)] flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {isMobileView && (
            <button
              onClick={() => {
                setShowChatWindow(false);
                console.log("Back to chat list");
              }}
              className={`p-2.5 rounded-full flex items-center justify-center transition-colors border ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'}`}
              aria-label="Back to chat list"
              title="Back to chat list"
            >
              <FaArrowLeft className={isDarkMode ? 'text-white' : 'text-gray-700'} />
            </button>
          )}
          <div className="flex flex-col">
            <h3 className="text-lg text-[var(--color-text)] font-['Nunito',sans-serif] font-semibold">
              {!chatRoom.isGroup ? (
                (() => {
                  const status = renderConnectionStatus();
                  if (typeof status === 'string') {
                    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
                  }
                  return extractChatRoomName(chatRoom).charAt(0).toUpperCase() + extractChatRoomName(chatRoom).slice(1).toLowerCase();
                })()
              ) : (
                extractChatRoomName(chatRoom).charAt(0).toUpperCase() + extractChatRoomName(chatRoom).slice(1).toLowerCase()
              )}
            </h3>
            {chatRoom.isGroup && (
              <span className="text-xs text-gray-500 font-medium">
                {chatRoom.users.length} {chatRoom.users.length === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>
        </div>
        

        
        {/* Menu/Avatar on the right */}
        {chatRoom.isGroup ? (
          <button
            onClick={() => setShowGroupMenu(!showGroupMenu)}
            className={`p-2.5 rounded-full flex items-center justify-center transition-colors border ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-gray-200 hover:bg-gray-300 border-gray-300'}`}
            aria-label="Group menu"
            title="Group details"
          >
            <HiMenu size={20} className={isDarkMode ? 'text-white' : 'text-gray-700'} />
          </button>
        ) : otherUser ? (
          <div
            className="flex items-center justify-end ml-2 cursor-pointer"
            onClick={() => setShowOtherProfile(true)}
            title="View profile"
          >
            <img
              src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                otherUser.username || "user"
              )}`}
              alt="user avatar"
              className="w-10 h-10 rounded-full bg-gray-200 object-cover border-2 border-white"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.style.width = "40px";
                fallback.style.height = "40px";
                fallback.style.borderRadius = "50%";
                fallback.style.background = "#e0e0e0";
                fallback.style.display = "flex";
                fallback.style.alignItems = "center";
                fallback.style.justifyContent = "center";
                fallback.style.fontWeight = "bold";
                fallback.style.fontSize = "18px";
                fallback.style.color = "#888";
                fallback.innerText = otherUser.username
                  ? otherUser.username.charAt(0).toUpperCase()
                  : "?";
                target.parentNode?.insertBefore(fallback, target.nextSibling);
              }}
            />
          </div>
        ) : null}
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
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.style.width = "96px";
                fallback.style.height = "96px";
                fallback.style.borderRadius = "50%";
                fallback.style.background = "#e0e0e0";
                fallback.style.display = "flex";
                fallback.style.alignItems = "center";
                fallback.style.justifyContent = "center";
                fallback.style.fontWeight = "bold";
                fallback.style.fontSize = "40px";
                fallback.style.color = "#888";
                fallback.innerText = otherUser.username
                  ? otherUser.username.charAt(0).toUpperCase()
                  : "?";
                target.parentNode?.insertBefore(fallback, target.nextSibling);
              }}
            />
            <h2 className="text-lg font-bold mb-2">{otherUser.username}</h2>
            {otherUser.email && (
              <p className="text-gray-500 mb-2">{otherUser.email}</p>
            )}
          </div>
        </div>
      )}

      {/* Messages List (Scrollable) */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 bg-[var(--color-background)] text-[var(--color-text)] scrollbar-hide min-h-0"
        style={{
          height: isMobileView ? 'calc(100vh - 140px)' : 'auto'
        }}
      >
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

      {/* Message Input (Fixed Bottom) */}
      <div className="border-t border-[var(--color-border)] p-4 bg-[var(--color-background)] sticky bottom-0 z-20 pb-safe">
        <MessageInput isGroup={chatRoom?.isGroup ?? false} />
      </div>

      {/* Group Menu Sliding Panel */}
      {chatRoom?.isGroup && (
        <AnimatePresence>
          {showGroupMenu && (
            <>
              {/* Backdrop - only on mobile */}
              {isMobileView && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                  onClick={() => setShowGroupMenu(false)}
                />
              )}
              
              {/* Sliding Panel */}
              <motion.div
                initial={isMobileView ? { y: "100%" } : { x: "100%" }}
                animate={isMobileView ? { y: 0 } : { x: 0 }}
                exit={isMobileView ? { y: "100%" } : { x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={`fixed bg-[var(--color-background)] border border-[var(--color-border)] z-50 overflow-hidden ${
                  isMobileView 
                    ? "bottom-0 left-0 right-0 rounded-t-3xl max-h-[80vh]" 
                    : "top-0 right-0 h-full w-80 shadow-2xl"
                }`}
              >
                {/* Handle - only on mobile */}
                {isMobileView && (
                  <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  </div>
                )}
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl font-semibold ${groupPanelTextClass}`}>
                        {extractChatRoomName(chatRoom)}
                      </h3>
                      <p className={`text-sm mt-1 ${groupPanelTextClass}`}>
                        {chatRoom.users.length} {chatRoom.users.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    {!isMobileView && (
                      <button
                        onClick={() => setShowGroupMenu(false)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Stats Section */}
                <div className="px-6 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowMembersList(!showMembersList)}
                      className={`bg-gray-50 p-4 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 cursor-pointer ${groupPanelHoverClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-black" fill="none" stroke="black" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className={`text-lg font-semibold ${isDarkMode ? 'text-black' : groupPanelTextClass}`}>{chatRoom.users.length}</p>
                          <p className={`text-xs ${isDarkMode ? 'text-black' : groupPanelTextClass}`}>Members</p>
                        </div>
                      </div>
                    </button>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="none" stroke="black" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className={`text-base font-bold ${isDarkMode ? 'text-black' : groupPanelTextClass}`}>
                          Created{' '}
                          <span className="font-normal text-gray-500">
                            {chatRoom.lastMessageTimestamp ? new Date(chatRoom.lastMessageTimestamp).toLocaleDateString() : 'No date info'}
                          </span>
                        </p>
                        <p className={`text-sm font-semibold ${isDarkMode ? 'text-black' : groupPanelTextClass}`}>Group Info</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="space-y-2">
                    <button className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 ${groupPanelTextClass} ${groupPanelHoverClass}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} fill="none" stroke={isDarkMode ? 'white' : 'black'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Members</span>
                    </button>
                    <button className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 ${groupPanelTextClass} ${groupPanelHoverClass}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} fill="none" stroke={isDarkMode ? 'white' : 'black'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit Group</span>
                    </button>
                    <button className={`w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 ${groupPanelTextClass} ${groupPanelHoverClass}`}>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-black'}`} fill="none" stroke={isDarkMode ? 'white' : 'black'} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2z" />
                      </svg>
                      <span>Share Group</span>
                    </button>
                  </div>
                </div>

                {/* Members List - Conditional */}
                {showMembersList && (
                  <div className="border-t border-gray-100">
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`text-lg font-semibold ${groupPanelTextClass}`}>
                          All Members ({chatRoom.users.length})
                        </h4>
                        <button 
                          onClick={() => setShowMembersList(false)}
                          className={`text-sm hover:text-gray-700 ${groupPanelTextClass}`}
                        >
                          Close
                        </button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {chatRoom.users.map((member) => (
                          <div key={member.id} className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors ${groupPanelTextClass} ${groupPanelHoverClass}`}>
                            <div className="relative">
                              <img
                                src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                                  member.username || "user"
                                )}`}
                                alt={`${member.username} avatar`}
                                className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const fallback = document.createElement("div");
                                  fallback.style.width = "40px";
                                  fallback.style.height = "40px";
                                  fallback.style.borderRadius = "50%";
                                  fallback.style.background = "#e0e0e0";
                                  fallback.style.display = "flex";
                                  fallback.style.alignItems = "center";
                                  fallback.style.justifyContent = "center";
                                  fallback.style.fontWeight = "bold";
                                  fallback.style.fontSize = "16px";
                                  fallback.style.color = "#888";
                                  fallback.innerText = member.username
                                    ? member.username.charAt(0).toUpperCase()
                                    : "?";
                                  target.parentNode?.insertBefore(fallback, target.nextSibling);
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <p className={`font-medium ${groupPanelTextClass}`}>
                                {member.username}
                              </p>
                              {member.email && (
                                <p className={`text-sm ${groupPanelTextClass}`}>{member.email}</p>
                              )}
                            </div>
                            {member.id === user?.id && (
                              <span className={`text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ${groupPanelTextClass}`}>
                                You
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
