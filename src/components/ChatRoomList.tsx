import { useState, useEffect } from "react";
import { FiLogOut, FiPlus, FiSearch } from "react-icons/fi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import ChatRooms from "./ChatRooms";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";
import type { Message } from "../Types/EntityTypes/Message";

export interface ChatRoomListProps {
  chatRoomId: string;
  onSelectChatRoom: (id: string) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  isMobileView: boolean;
}

const colors = [
  "bg-gray-500",
  "bg-gray-600",
  "bg-gray-700",
  "bg-blue-400",
  "bg-indigo-400",
  "bg-emerald-400",
  "bg-teal-400",
  "bg-cyan-400",
  "bg-rose-400",
  "bg-amber-400",
];

function getLastMessage(messages: Message[] | null | undefined) {
  if (!messages || messages.length === 0) return null;
  return messages.reduce((latest, msg) =>
    new Date(msg.timestamp ?? 0) > new Date(latest.timestamp ?? 0)
      ? msg
      : latest
  );
}

export default function ChatRoomList({
  onSelectChatRoom,
  toggleDarkMode,
  isDarkMode,
  isMobileView,
}: ChatRoomListProps) {
  const {
    chatRooms,
    getChatRoomsRelatedToUser,
    getChatRoomByName,
    openChatRoom,
  } = useChatRoom();

  const { user, logout } = useAuth();
  const { messagesByChatRoomId, fetchMessagesByChatRoomId } = useMessage();
  const { connectionStatus } = useSignal();

  const [showAllUsers, setShowAllUsers] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(null);
  const [error, setError] = useState("");
  const [plus, setPlus] = useState(true);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) getChatRoomsRelatedToUser(user.id);
  }, [user?.id, getChatRoomsRelatedToUser]);

  useEffect(() => {
    chatRooms.forEach((room) => {
      if (!messagesByChatRoomId[room.chatRoomId]) {
        fetchMessagesByChatRoomId(room.chatRoomId);
      }
    });
  }, [chatRooms, messagesByChatRoomId, fetchMessagesByChatRoomId]);

  const getRandomColor = (index: number) => colors[index % colors.length];

  const getChatRoomName = (room: ChatRoomType) => {
    if (room.isGroup) {
      const name = room.name.trim();
      return name
        ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
        : "Unnamed Group";
    }
    const otherUser = room.users.find((u) => u.id !== user?.id);
    return otherUser?.username || "Unknown";
  };

  const handleSearch = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter a chat room name to search.");
      return;
    }
    setError("");
    const result: ChatRoomType | null = await getChatRoomByName(name.trim());
    if (result !== null && result !== undefined) {
      setChatRoom(result);
    } else {
      setChatRoom(null);
      setError("No chat room found with that name.");
    }
  };

  const handleReset = () => {
    setSearchText("");
    setChatRoom(null);
    setError("");
  };

  const Spinner = () => (
    <div className="flex items-center gap-[2px] ml-2 h-4">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className="w-[2px] h-full rounded-sm animate-spike"
          style={{
            animationDelay: `${i * 0.1}s`,
            backgroundColor: "var(--color-primary)",
          }}
        />
      ))}
    </div>
  );

  const renderChatRoom = (room: ChatRoomType, index: number) => {
    const chatRoomName = getChatRoomName(room);
    const dpLetter = chatRoomName.charAt(0).toUpperCase();
    const bgColor = getRandomColor(index);
    const messages = messagesByChatRoomId[room.chatRoomId] || [];
    const lastMessage = getLastMessage(messages);

    const handleClick = () => {
      if (!room?.chatRoomId) return;
      openChatRoom(room.chatRoomId);
      onSelectChatRoom?.(room.chatRoomId);
    };

    const compactView = screenWidth >= 768 && screenWidth <= 862;

    return (
      <div
        key={room.chatRoomId}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className="flex mb-3 items-start gap-4 p-[var(--space-3)] rounded-[var(--radius-lg)] bg-[var(--color-chat)] shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
      >
        <div
          className={`${
            compactView ? "w-10 h-10 text-lg" : "w-14 h-14 text-xl"
          } flex items-center justify-center rounded-full text-white font-bold flex-shrink-0 ${bgColor}`}
        >
          {dpLetter}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span
              className={`font-semibold truncate ${
                compactView ? "text-sm" : ""
              }`}
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-primary)",
                fontSize: compactView ? "0.875rem" : "var(--font-size-base)",
              }}
              title={chatRoomName}
            >
              {chatRoomName}
            </span>
            <span
              className="text-xs whitespace-nowrap"
              style={{ color: "var(--color-secondary)" }}
            >
              {lastMessage
                ? new Date(lastMessage.timestamp ?? 0).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>

          <p
            className={`truncate italic ${compactView ? "text-xs" : "text-sm"}`}
            style={{ color: "var(--color-chat-text)" }}
          >
            {lastMessage ? (
              room.isGroup ? (
                <>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        lastMessage.sender?.id === user?.id
                          ? "var(--color-primary)"
                          : "var(--color-text)",
                    }}
                  >
                    {lastMessage.sender?.id === user?.id
                      ? "You"
                      : lastMessage.sender?.username}
                  </span>
                  <span style={{ color: "var(--color-chat-text)" }}>
                    : {lastMessage.content}
                  </span>
                </>
              ) : (
                <span style={{ color: "var(--color-chat-text)" }}>
                  {lastMessage.content}
                </span>
              )
            ) : (
              <span style={{ color: "var(--color-chat-text)" }}>
                No messages yet
              </span>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-[var(--color-background)] relative overflow-hidden"
      style={{ fontFamily: "var(--font-primary)" }}
    >
      {/* Top Bar */}
      <div
        className="flex justify-between items-center px-[var(--space-4)] py-[var(--space-3)] border-b shadow-sm sticky top-0 z-10 bg-[var(--color-background)]"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: "var(--color-text)" }}
        >
          {connectionStatus === "connected" ? (
            showAllUsers ? (
              "All Users"
            ) : (
              "Chats"
            )
          ) : connectionStatus === "connecting" ||
            connectionStatus === "reconnecting" ? (
            <>
              {connectionStatus === "connecting"
                ? "Connecting"
                : "Reconnecting"}
              <Spinner />
            </>
          ) : (
            "Disconnected"
          )}
        </h3>

        <div className="flex items-center gap-2">
          {isMobileView && (
            <button
              onClick={toggleDarkMode}
              className="text-xl text-[var(--color-text)] bg-[var(--color-input-bg)] p-2 rounded-full"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
          )}

          <button
            onClick={logout}
            className="bg-[var(--color-input-bg)] p-2 rounded-full text-gray-600 hover:text-red-500"
            title="Logout"
          >
            <FiLogOut />
          </button>

          <button
            onClick={() => {
              setShowAllUsers((prev) => !prev);
              setPlus((prev) => !prev);
            }}
            className="bg-[var(--color-input-bg)] p-2 rounded-full text-gray-600 hover:text-green-500"
            title={plus ? "Add user" : "Back"}
          >
            {plus ? <FiPlus /> : <IoMdArrowRoundBack />}
          </button>
        </div>
      </div>

      {!showAllUsers && (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(searchText);
            }}
            className="flex items-center bg-[var(--color-input-bg)] mx-[var(--space-4)] mt-[var(--space-4)] px-[var(--space-3)] py-[var(--space-2)] rounded-full shadow-sm"
          >
            <button type="submit" className="text-[var(--color-text)]">
              <FiSearch />
            </button>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none flex-1 text-sm ml-2"
              style={{ color: "var(--color-text)" }}
            />
          </form>
          {chatRoom && (
            <button
              onClick={handleReset}
              className="text-sm text-[var(--color-primary)] mt-2 ml-5"
            >
              Clear search
            </button>
          )}
          {error && <p className="text-red-500 text-xs mt-2 ml-5">{error}</p>}
        </>
      )}

      <div className="flex-1 mt-[var(--space-4)] px-[var(--space-4)] pb-[var(--space-6)] overflow-y-auto scrollbar-hide">
        {showAllUsers ? (
          <ChatRooms />
        ) : (
          <ul className="space-y-3">
            {chatRoom
              ? renderChatRoom(chatRoom, 0)
              : [...chatRooms]
                  .sort(
                    (a, b) =>
                      new Date(b.lastMessageTimestamp ?? 0).getTime() -
                      new Date(a.lastMessageTimestamp ?? 0).getTime()
                  )
                  .map((room, index) => renderChatRoom(room, index))}
          </ul>
        )}
      </div>
    </div>
  );
}
