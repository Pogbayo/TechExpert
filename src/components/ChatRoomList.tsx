import { useState, useEffect, useRef } from "react";
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
import ChatRoomRow from "./ChatRoomRow";
import { FiLogOut, FiPlus, FiSearch, FiFilter, FiX, FiRefreshCw } from "react-icons/fi";

export interface ChatRoomListProps {
  chatRoomId: string;
  onSelectChatRoom: (chatRoomId: string) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  isMobileView: boolean;
  setShowChatWindow?: (val: boolean) => void;
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
  setShowChatWindow,
}: ChatRoomListProps) {
  const {
    chatRooms,
    getChatRoomsRelatedToUser,
    getChatRoomByName,
    setCurrentChatRoomId,
    refreshChatRoomsFromServer,
    pinChatRoom,
    unpinChatRoom,
    unreadCount,
    markAsRead,
    setUnreadCount,
    openChatRoom,
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
  const [isFilterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const filterOptions = ["All", "Groups", "Unread", "Users"] as const;
  const [activeFilter, setActiveFilter] =
    useState<(typeof filterOptions)[number]>("All");
  const onlineUsers = useOnlineUsers();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user?.id) getChatRoomsRelatedToUser(user.id);
  }, [user?.id, getChatRoomsRelatedToUser]);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setFilterMenuOpen(false);
      }
    }
    if (isFilterMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterMenuOpen]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollTop = scrollContainer.scrollTop;
      const isScrollingUp =
        currentScrollTop > lastScrollTop && currentScrollTop > 50;
      setIsScrolledUp(isScrollingUp);
      setLastScrollTop(currentScrollTop);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [lastScrollTop]);

  const handleSearch = async (name: string) => {
    if (!name.trim()) {
      setError("Please enter a chat room name or username to search.");
      return;
    }
    setError("");

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

  const handleLogout = async () => {
    console.log("🚪 Logging out - clearing chat room ID and stopping SignalR");
    setCurrentChatRoomId(null);
    if (connection) {
      try {
        await connection.stop();
        console.log("SignalR connection stopped successfully");
        // Small delay to ensure connection cleanup completes
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error("Failed to stop SignalR connection:", err);
      }
    }
    logout();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSelectChatRoom = async (chatRoomId: string) => {
    const unread = unreadCount[chatRoomId] || 0;
    const messages = messagesByChatRoomId[chatRoomId] || [];
    if (!user?.id) return;

    if (unread > 0) {
      const notFromUser = messages.filter((msg) => msg.sender?.id !== user.id);
      const lastUnreadMessages = notFromUser.slice(-unread);
      const messageIds = lastUnreadMessages.map((msg) => msg.messageId);
      console.log(messageIds);
      if (messageIds.length > 0) {
        const response = await markAsRead(messageIds, user.id);
        if (response?.success == true) {
          setUnreadCount((prev) => ({ ...prev, [chatRoomId]: 0 }));
        } else {
          console.log(response?.data && response.message);
          setUnreadCount((prev) => ({ ...prev, [chatRoomId]: unread }));
        }
      }
    }

    await openChatRoom(chatRoomId);
    setCurrentChatRoomId(chatRoomId);
    onSelectChatRoom(chatRoomId);

    if (setShowChatWindow) setShowChatWindow(true);
  };

  const renderChatRoom = (room: ChatRoomType, index: number) => {
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
        unreadCount={unreadCount}
        handleArchive={(e) => {
          e.stopPropagation();
          setOpenMenu(null);
          alert("Archive feature coming soon!");
        }}
        handleDelete={(e) => {
          e.stopPropagation();
          setOpenMenu(null);
          alert("Delete feature coming soon!");
        }}
        onSelectChatRoom={handleSelectChatRoom}
        compactView={compactView}
        onlineUsers={onlineUsers}
        setCurrentChatRoomId={setCurrentChatRoomId}
        isMobileView={isMobileView}
      />
    );
  };

  function filteredRooms(chatRooms: ChatRoomType[]): ChatRoomType[] {
    if (activeFilter === "All") {
      return chatRooms;
    }

    if (activeFilter === "Groups") {
      return chatRooms.filter((room) => room.isGroup);
    }

    if (activeFilter === "Users") {
      return chatRooms.filter((room) => !room.isGroup);
    }

    if (activeFilter === "Unread") {
      return chatRooms.filter(
        (room) => (unreadCount[room.chatRoomId] || 0) > 0
      );
    }

    return chatRooms;
  }

  const [isDarkModeState, setIsDarkModeState] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkModeState(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="flex flex-col h-full w-full bg-[var(--color-background)] relative overflow-hidden chatroom-list-body"
      style={{ fontFamily: "var(--font-primary)" }}
    >
      <div
        className="flex justify-between items-center px-[var(--space-4)] py-[var(--space-3)] border-b shadow-sm sticky top-0 z-30 bg-[var(--color-background)]"
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
            onClick={handleRefresh}
            className="bg-[var(--color-input-bg)] p-2 rounded-full text-gray-600 hover:text-blue-500"
            title="Refresh app"
          >
            <FiRefreshCw />
          </button>

          <button
            onClick={handleLogout}
            className="bg-[var(--color-input-bg)] p-2 rounded-full text-gray-600 hover:text-red-500"
            title="Logout"
          >
            <FiLogOut />
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
          <div
            className={`flex items-center gap-2 mx-[var(--space-2)] mt-2 sticky top-[var(--header-height)] z-20 bg-[var(--color-background)] transition-transform duration-300 ${
              isScrolledUp ? "translate-y-[-100%]" : "translate-y-0"
            }`}
            style={{ "--header-height": "60px" } as React.CSSProperties}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchText);
              }}
              className="flex-1 flex items-center bg-[var(--color-input-bg)] px-[var(--space-3)] py-[var(--space-2)] rounded-full shadow-sm"
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
                style={{
                  color: "var(--color-text)",
                  fontSize: "16px",
                }}
              />
            </form>

            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setFilterMenuOpen((prev) => !prev)}
                className="p-3 bg-[var(--color-input-bg)] rounded-full text-[var(--color-text)] shadow-sm"
                title="Filter chats"
              >
                <FiFilter />
              </button>

              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-30 border border-gray-200 dark:border-gray-700">
                  {filterOptions.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setActiveFilter(filter);
                        setFilterMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className={`flex gap-2 ml-8 mt-2 mb-2 sticky top-[calc(var(--header-height)+var(--search-height))] z-10 transition-transform duration-300 ${
              isScrolledUp ? "translate-y-[-100%]" : "translate-y-0"
            }`}
            style={{ "--search-height": "48px" } as React.CSSProperties}
          >
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-[20px] text-xs font-bold transition-colors`}
                style={{
                  minWidth: 56,
                  backgroundColor:
                    activeFilter === filter ? "#e6f9ec" : "#e5e7eb",
                  color: activeFilter === filter ? "#166534" : "#111",
                  border: "none",
                }}
              >
                {filter}
              </button>
            ))}
          </div>
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

      <div
        ref={scrollContainerRef}
        className="flex-1 mt-[var(--space-4)] px-[var(--space-4)] pb-[var(--space-6)] overflow-y-auto scrollbar-hide"
      >
        {showAllUsers ? (
          <ChatRooms
            onUserOrGroupSelected={(chatRoomId: string) => {
              onSelectChatRoom(chatRoomId);
              setShowAllUsers(false);
            }}
            setShowChatWindow={setShowChatWindow}
            isMobileView={isMobileView}
            isDarkMode={isDarkMode}
          />
        ) : (
          <ul className="space-y-3">
            {chatRoom
              ? renderChatRoom(chatRoom, 0)
              : filteredRooms(chatRooms)
                  .sort((a, b) => {
                    if (a.pinned && !b.pinned) return -1;
                    if (!a.pinned && b.pinned) return 1;
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
                  .map((room, index) => renderChatRoom(room, index))}
          </ul>
        )}
      </div>

      <button
        onClick={() => {
          setShowAllUsers((prev) => !prev);
          setPlus((prev) => !prev);
        }}
        className={`absolute bottom-6 right-6 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all text-3xl
          ${
            isDarkModeState
              ? "bg-white text-blue-600 hover:bg-gray-200"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        title={plus ? "Add user or join group" : "Back"}
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.18)" }}
      >
        {plus ? <FiPlus /> : <FiX />}
      </button>
    </div>
  );
}