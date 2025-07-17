/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useEffect, useRef } from "react";
// import { createPortal } from "react-dom";
// import {
//   FiLogOut,
//   FiPlus,
//   FiSearch,
//   FiMoreVertical,
//   FiX,
// } from "react-icons/fi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import ChatRooms from "./ChatRooms";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import { useSignal } from "../context/SignalRContextFolder/useSignalR";
import type { Message } from "../Types/EntityTypes/Message";
import * as signalR from "@microsoft/signalr";
import { useOnlineUsers } from "../context/OnlineUsersContext";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// import { formatLastMessageTime } from "../utils/dateUtils";
import ChatRoomRow from "./ChatRoomRow";
import { FiLogOut, FiPlus, FiSearch } from "react-icons/fi";

export interface ChatRoomListProps {
  chatRoomId: string;
  onSelectChatRoom: (id: string) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  isMobileView: boolean;
}

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
    setCurrentChatRoomId,
    refreshChatRoomsFromServer,
    pinChatRoom,
    unpinChatRoom,
  } = useChatRoom();

  const { user, logout } = useAuth();
  const { messagesByChatRoomId, fetchMessagesByChatRoomId } = useMessage();
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(null);
  const [error, setError] = useState("");
  const [plus, setPlus] = useState(true);
  const { connection } = useSignal();
  const connectionStatus = connection?.state;
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [showAbove, setShowAbove] = useState<{ [id: string]: boolean }>({});
  // const [menuPosition, setMenuPosition] = useState<{
  //   top: number;
  //   left: number;
  //   showAbove: boolean;
  // } | null>(null);

  useEffect(() => {
    const handleResize: () => void = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) getChatRoomsRelatedToUser(user.id);
  }, [user?.id, getChatRoomsRelatedToUser]);

  // Refresh chat rooms when user returns to the tab (handles cases where SignalR missed the deletion)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        console.log("👁️ Page became visible, refreshing chat rooms");
        refreshChatRoomsFromServer(user.id);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user?.id, refreshChatRoomsFromServer]);

  useEffect(() => {
    chatRooms.forEach((room) => {
      if (!messagesByChatRoomId[room.chatRoomId]) {
        fetchMessagesByChatRoomId(room.chatRoomId);
      }
    });
  }, [chatRooms, messagesByChatRoomId, fetchMessagesByChatRoomId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    if (openMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenu]);

  // const getRandomColor = (index: number) => colors[index % colors.length];

  // const getChatRoomName = (room: ChatRoomType) => {
  //   if (room.isGroup) {
  //     const name = room.name.trim();
  //     return name
  //       ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  //       : "Unnamed Group";
  //   }
  //   const otherUser = room.users.find((u) => u.id !== user?.id);
  //   return otherUser?.username || "Unknown";
  // };

  const handleSearch = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter a chat room name or username to search.");
      return;
    }
    setError("");

    //  Searching for a user on the frontend first and if not found I revert to the backend to search for a group by the provided name
    const dmRoom = chatRooms.find(
      (room) =>
        !room.isGroup &&
        room.users.some(
          (u) =>
            u.id !== user?.id &&
            u.username.toLowerCase() === name.trim().toLowerCase()
        )
    );
    if (dmRoom) {
      setChatRoom(dmRoom);
      return;
    }

    // 2. Otherwise, search for a group by name (backend)
    const result: ChatRoomType | null = await getChatRoomByName(name.trim());
    if (result !== null && result !== undefined) {
      setChatRoom(result);
    } else {
      setChatRoom(null);
      setError("No chat room or user found with that name.");
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

  const hanldeLogOUt = () => {
    console.log("🚪 Logging out - clearing chat room ID");
    setCurrentChatRoomId(null);
    logout();
  };
  const renderChatRoom = (room: ChatRoomType, index: number) => {
    // const chatRoomName = getChatRoomName(room);
    // const messages = messagesByChatRoomId[room.chatRoomId] || [];
    // const lastMessage = getLastMessage(messages);
    const compactView = screenWidth >= 768 && screenWidth <= 862;
    return (
      <ChatRoomRow
        key={room.chatRoomId}
        room={room}
        index={index}
        user={user}
        messagesByChatRoomId={messagesByChatRoomId}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
        showAbove={showAbove}
        setShowAbove={setShowAbove}
        pinChatRoom={pinChatRoom}
        unpinChatRoom={unpinChatRoom}
        handleArchive={(e) => {
          e.stopPropagation();
          setOpenMenu(null);
          // TODO: Implement archive logic
          alert("Archive feature coming soon!");
        }}
        handleDelete={(e) => {
          e.stopPropagation();
          setOpenMenu(null);
          // TODO: Implement delete logic
          alert("Delete feature coming soon!");
        }}
        onSelectChatRoom={onSelectChatRoom}
        compactView={compactView}
        onlineUsers={useOnlineUsers()}
        setCurrentChatRoomId={setCurrentChatRoomId}
        isMobileView={isMobileView}
      />
    );
  };

  // const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();

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
          {connectionStatus === signalR.HubConnectionState.Connected ? (
            showAllUsers ? (
              "All Users"
            ) : (
              "Chats"
            )
          ) : connectionStatus === signalR.HubConnectionState.Connecting ? (
            <>
              Connecting
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
            onClick={hanldeLogOUt}
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

          <button
            onClick={() => navigate("/profile")}
            className="bg-[var(--color-input-bg)] p-2 rounded-full text-gray-600 hover:text-blue-500"
            title="View my profile"
          >
            <FaUserCircle />
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
          <ChatRooms
            onUserOrGroupSelected={(chatRoomId: string) => {
              onSelectChatRoom(chatRoomId);
              setShowAllUsers(false);
            }}
          />
        ) : (
          <ul className="space-y-3">
            {chatRoom
              ? renderChatRoom(chatRoom, 0)
              : [...chatRooms]
                  .sort((a, b) => {
                    // First, sort by pinned status (pinned rooms first)
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;

                    // Then sort by last message timestamp
                    const aMessages = messagesByChatRoomId[a.chatRoomId] || [];
                    const bMessages = messagesByChatRoomId[b.chatRoomId] || [];
                    const aLast = getLastMessage(aMessages);
                    const bLast = getLastMessage(bMessages);

                    const aTime = aLast
                      ? new Date(aLast.timestamp ?? 0).getTime()
                      : new Date(a.lastMessageTimestamp ?? 0).getTime();
                    const bTime = bLast
                      ? new Date(bLast.timestamp ?? 0).getTime()
                      : new Date(b.lastMessageTimestamp ?? 0).getTime();

                    return bTime - aTime;
                  })
                  .map((room, index) => {
                    return renderChatRoom(room, index);
                  })}
          </ul>
        )}
      </div>
    </div>
  );
}
