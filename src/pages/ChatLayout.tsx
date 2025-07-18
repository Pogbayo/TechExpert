import { useState, useEffect } from "react";
import ChatWindow from "../components/ChatWindow";
import ChatRoomList from "../components/ChatRoomList";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useWindowSize } from "../components/useWindowSize";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContextFoler/useTheme";

export default function ChatLayout() {
  const { getChatRoomById, chatRoom, openChatRoom } = useChatRoom();
  const windowSize = useWindowSize();
  const isMobileView = windowSize <= 769.9333;

  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(
    null
  );
  const [showChatWindow, setShowChatWindow] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  // Auto-select first chat room when chatRooms load and none selected
  // useEffect(() => {
  //   if (!selectedChatRoomId && chatRooms.length > 0) {
  //     const firstChatRoomId = chatRooms[0].chatRoomId;
  //     setSelectedChatRoomId(firstChatRoomId);
  //     openChatRoom(firstChatRoomId);
  //   }
  // }, [chatRooms, selectedChatRoomId, openChatRoom]);

  // Theme setup on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark =
      storedTheme === "dark" ||
      (!storedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (prefersDark) {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  // Load chat room if one is selected
  useEffect(() => {
    if (selectedChatRoomId) {
      getChatRoomById(selectedChatRoomId);
    }
  }, [selectedChatRoomId, getChatRoomById]);

  const handleSelectChatRoom = (id: string) => {
    setSelectedChatRoomId(id);
    openChatRoom(id);
    if (isMobileView) {
      setShowChatWindow(true);
      console.log("Opening chat window on mobile");
    }
  };

  // const toggleDarkMode = () => {
  //   const html = document.documentElement;
  //   if (html.classList.contains("dark")) {
  //     html.classList.remove("dark");
  //     localStorage.setItem("theme", "light");
  //     setIsDarkMode(false);
  //   } else {
  //     html.classList.add("dark");
  //     localStorage.setItem("theme", "dark");
  //     setIsDarkMode(true);
  //   }
  // };

  // Debug log for which component is being rendered
  // console.log('ChatLayout render: isMobileView', isMobileView, 'showChatWindow', showChatWindow);
  return (
    <div className="h-screen bg-white flex flex-col text-[var(--color-text)] font-[var(--font-primary)]">
      {/* Header with dark mode toggle and profile icon (desktop only) */}
      {!isMobileView && (
        <header className="flex items-center justify-between px-[var(--space-2)] py-[var(--space-2)] border-b border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)]">
          <h1 style={{ fontSize: "var(--font-size-sm)" }} className="font-bold">
            Spag Chat
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="focus:outline-none text-xl text-[var(--color-text)] bg-[var(--color-input-bg)] p-2 rounded-full"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="focus:outline-none text-xl text-[var(--color-text)] bg-[var(--color-input-bg)] p-2 rounded-full"
              aria-label="View my profile"
              title="View my profile"
            >
              <FaUserCircle />
            </button>
          </div>
        </header>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {(!isMobileView || !showChatWindow) && (
          <div className="w-full md:w-1/4 border-r border-[var(--color-border)] bg-[var(--color-background)] flex flex-col h-full">
            {!isMobileView && (
              <p
                className="mb-[var(--space-4)] px-[var(--space-4)] mt-[var(--space-4)] font-black"
                style={{
                  color: "var(--color-chat-text)",
                  fontSize: "var(--font-size-base)",
                }}
              ></p>
            )}
            <ChatRoomList
              isMobileView={isMobileView}
              chatRoomId={selectedChatRoomId ?? ""}
              onSelectChatRoom={handleSelectChatRoom}
              toggleDarkMode={toggleTheme}
              isDarkMode={isDarkMode}
              setShowChatWindow={setShowChatWindow}
            />
          </div>
        )}

        {(!isMobileView && true) || (isMobileView && showChatWindow) ? (
          <div className="flex-1 p-0 flex flex-col bg-[var(--color-background)] min-h-[50vh]">
            <ChatWindow
              selectedChatRoomId={selectedChatRoomId}
              chatRoom={chatRoom}
              isMobileView={isMobileView}
              setShowChatWindow={setShowChatWindow}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
