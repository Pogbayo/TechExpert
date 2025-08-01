/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRef, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  // FiMoreVertical,
  // FiX,
  FiTrash,
  FiArchive,
  FiPaperclip,
} from "react-icons/fi";
import { formatLastMessageTime } from "../utils/dateUtils";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import { useSwipeable } from "react-swipeable";
import { useEffect } from "react";
import type { ChatRoomRowProps } from "../Types/ContextTypes/contextType";
import Avatar from "./Avatar";
// import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";

export default function ChatRoomRow({
  room,
  //   index,
  user,
  unreadCount,
  messagesByChatRoomId,
  openMenu,
  setOpenMenu,
  showAbove,
  setShowAbove,
  pinChatRoom,
  unpinChatRoom,
  handleArchive,
  handleDelete,
  onSelectChatRoom,
  compactView,
  onlineUsers,
  // setCurrentChatRoomId,
  isMobileView,
}: ChatRoomRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuShouldRender, setMenuShouldRender] = useState(false);
  const [swipeAction, setSwipeAction] = useState<"none" | "left" | "right">(
    "none"
  );
  const [swiping, setSwiping] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const [_ACTION_WIDTH, setACTION_WIDTH] = useState(70); // Default for desktop
  // const isDarkMode =
  //   typeof window !== "undefined" &&
  //   window.matchMedia &&
  //   window.matchMedia("(prefers-color-scheme: dark)").matches;
  // const {setCurrentChatRoomId} = useChatRoom()
  useLayoutEffect(() => {
    if (openMenu === room.chatRoomId && rowRef.current) {
      const rect = rowRef.current.getBoundingClientRect();
      const menuHeight = 140;
      const spaceBelow = window.innerHeight - rect.bottom;
      const shouldShowAbove = spaceBelow < menuHeight;
      setShowAbove((prev) => ({
        ...prev,
        [room.chatRoomId]: shouldShowAbove,
      }));
      setMenuPos({
        top: shouldShowAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
        left: rect.right - 140, // menu width
      });
      setMenuShouldRender(true);
      setTimeout(() => setMenuVisible(true), 10); // allow for animation
    } else if (openMenu !== room.chatRoomId) {
      setMenuVisible(false);
      setTimeout(() => setMenuShouldRender(false), 250); // match CSS duration
      setTimeout(() => setMenuPos(null), 250);
    }
  }, [openMenu, room.chatRoomId, setShowAbove]);

  useEffect(() => {
    const handleResize = () => {
      setACTION_WIDTH(isMobileView ? 70 : 140);
      const menuHeight = 140;
      if (rowRef.current) {
        const rect = rowRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const shouldShowAbove = spaceBelow < menuHeight;
        setShowAbove((prev) => ({
          ...prev,
          [room.chatRoomId]: shouldShowAbove,
        }));
        setMenuPos({
          top: shouldShowAbove ? rect.top - menuHeight - 8 : rect.bottom + 8,
          left: rect.right - 140,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileView, room.chatRoomId, setShowAbove, setMenuPos]);
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!isMobileView) return;
      setSwiping(true);
      setSwipeX(e.deltaX);
    },
    onSwiped: (e) => {
      if (!isMobileView) return;
      setSwiping(false);
      if (e.dir === "Left" && Math.abs(e.deltaX) > 60) {
        setSwipeAction("left"); // Show Delete
      } else if (e.dir === "Right" && Math.abs(e.deltaX) > 60) {
        setSwipeAction("right"); // Show Archive/Pin
      } else {
        setSwipeAction("none");
      }
      setSwipeX(0);
    },
    onTap: () => {
      if (!isMobileView) return;
      setSwipeAction("none");
      setSwipeX(0);
    },
    trackMouse: true, // allow mouse drag for testing
    trackTouch: true, // Ensure touch tracking is enabled
    delta: 10, // Minimum distance for swipe
    swipeDuration: 500, // Maximum time for swipe
  });
  const { ref: _swipeableRef, ...swipeableHandlers } = handlers;

  // Reset swipe action if not swiping
  useEffect(() => {
    if (!swiping && swipeAction !== "none") {
      const timeout = setTimeout(() => setSwipeAction("none"), 2000);
      return () => clearTimeout(timeout);
    }
  }, [swiping, swipeAction]);
  // console.log(ACTION_WIDTH)

  // Sort messages by timestamp before picking the last one
  const messages = (messagesByChatRoomId[room.chatRoomId] || []).slice();
  messages.sort((a, b) => {
    const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return aTime - bTime;
  });
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  // console.log(lastMessage);
  // console.log(room.name);
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
  const chatRoomName = getChatRoomName(room);

  const handleClick = () => {
    if (!room?.chatRoomId) return;
    // setCurrentChatRoomId(room.chatRoomId);
    onSelectChatRoom?.(room.chatRoomId);
  };

  // const logMesssagesByChatRoomId = (room: ChatRoomType) => {
  //   console.log(messagesByChatRoomId[room.chatRoomId]);
  // };

  // const handleMenuToggle = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setOpenMenu(openMenu === room.chatRoomId ? null : room.chatRoomId);
  // };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenu(null);
    if (room.pinned) {
      unpinChatRoom(room.chatRoomId);
    } else {
      pinChatRoom(room.chatRoomId);
    }
  };

  return (
    <div className="relative">
      {/* Swipe actions for mobile (z-0, behind row) */}
      {isMobileView && (
        <>
          {/* Right swipe: Archive + Pin */}
          {(swipeAction === "right" || (swiping && swipeX > 0)) && (
            <div
              className="absolute left-0 top-0 h-full flex z-0 overflow-hidden"
              style={{
                width:
                  swiping && swipeX > 0
                    ? `${swipeX}px`
                    : swipeAction === "right"
                    ? "140px"
                    : "0px",
                transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <button
                onClick={(e) => {
                  handleArchive(e);
                  setSwipeAction("none");
                }}
                className="flex items-center justify-center w-1/2 h-full bg-yellow-400 text-white font-bold text-xs"
              >
                <FiArchive className="mr-1" /> Archive
              </button>
              <button
                onClick={(_e) => {
                  // console.log(e)
                  if (room.pinned) {
                    unpinChatRoom(room.chatRoomId);
                  } else {
                    pinChatRoom(room.chatRoomId);
                  }
                  setSwipeAction("none");
                }}
                className="flex items-center justify-center w-1/2 h-full bg-blue-500 text-white font-bold text-xs"
              >
                <FiPaperclip className="mr-1" /> {room.pinned ? "Unpin" : "Pin"}
              </button>
            </div>
          )}
          {/* Left swipe: Delete */}
          {(swipeAction === "left" || (swiping && swipeX < 0)) && (
            <div
              className="absolute right-0 top-0 h-full flex z-0 overflow-hidden"
              style={{
                width:
                  swiping && swipeX < 0
                    ? `${-swipeX}px`
                    : swipeAction === "left"
                    ? "70px"
                    : "0px",
                transition: "width 0.2s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              <button
                onClick={(e) => {
                  handleDelete(e);
                  setSwipeAction("none");
                }}
                className="flex items-center justify-center w-full h-full bg-red-500 text-white font-bold text-xs"
              >
                <FiTrash className="mr-1" /> Delete
              </button>
            </div>
          )}
        </>
      )}
      {/* Main row content (z-10, always above actions) */}
      <div
        ref={rowRef}
        {...swipeableHandlers}
        onClick={() => {
          if (!isMobileView) {
            handleClick();
          } else {
            if (swipeAction !== "none") {
              setSwipeAction("none");
            } else {
              handleClick();
            }
          }
        }}
        onTouchStart={() => {
          if (isMobileView) console.log("TOUCH START on row");
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={`relative flex items-start gap-4 px-[var(--space-3)] py-2 cursor-pointer transition-transform duration-200
          ${room.pinned ? "border-l-4 border-[var(--color-primary)]" : ""}
          ${openMenu === room.chatRoomId ? "scale-100" : "active:scale-[0.98]"}
          hover:bg-[var(--color-chat-bg)]
          select-none z-10
        `}
        style={{
          ...(isMobileView
            ? {
                transform: swiping
                  ? `translateX(${swipeX}px)`
                  : swipeAction === "left"
                  ? `translateX(-70px)`
                  : swipeAction === "right"
                  ? `translateX(140px)`
                  : "translateX(0)",
                transition: swiping
                  ? "none"
                  : "transform 0.2s cubic-bezier(0.4,0,0.2,1)",
                touchAction: "pan-x pan-y",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
              }
            : {}),
        }}
      >
        {/* Avatar */}
        {room.isGroup ? (
          <div
            className={`${
              compactView ? "w-9 h-9" : "w-12 h-12"
            } rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden`}
          >
            <svg
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              style={{ display: "block" }}
            >
              <circle cx="12" cy="16" r="6" fill="#60A5FA" />
              <circle cx="28" cy="16" r="6" fill="#F472B6" />
              <circle cx="20" cy="24" r="8" fill="#FBBF24" />
            </svg>
          </div>
        ) : (
          <Avatar
            username={chatRoomName}
            size={compactView ? 'sm' : 'lg'}
            showOnlineIndicator={true}
            isOnline={(() => {
              const otherUser = room.users.find((u) => u.id !== user?.id);
              return otherUser && onlineUsers.includes(otherUser.id);
            })()}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <span
              className={`font-bold truncate ${
                compactView ? "text-xs" : "text-sm"
              }`}
              style={{
                color: "var(--color-text)",
                fontFamily: "var(--font-primary)",
              }}
              title={chatRoomName}
            >
              {chatRoomName}
            </span>
            <span
              className="ml-2 text-[10px] whitespace-nowrap flex-shrink-0"
              style={{
                color: "grey",
                // unreadCount && unreadCount[room.chatRoomId] > 0
                //   ? isDarkMode
                //     ? "#166534"
                //     : "#22c55e"
                //   : "var(--color-text)",
              }}
            >
              {lastMessage && formatLastMessageTime(lastMessage.timestamp)
                ? (() => {
                    const formattedTime = formatLastMessageTime(
                      lastMessage.timestamp
                    );
                    if (formattedTime === "Yesterday") {
                      return "Yesterday";
                    }
                    if (formattedTime.includes("\n")) {
                      const [day, time] = formattedTime.split("\n");
                      return (
                        <span>
                          {day}
                          <span className="opacity-70 text-[10px]">{time}</span>
                        </span>
                      );
                    }
                    return formattedTime;
                  })()
                : ""}
            </span>
          </div>
          {/* Sender/message and unread badge row */}
          <div className="flex items-center justify-between w-full mt-0.5">
            <p
              className={`truncate flex-1 min-w-0 ${
                compactView ? "text-[10px]" : "text-xs"
              }`}
              style={{
                color: "grey",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              {lastMessage ? (
                room.isGroup ? (
                  <>
                    <span
                      className="font-medium"
                      style={{
                        color: "grey",
                        // lastMessage.sender?.id === user?.id
                        //   ? "var(--color-primary)"
                        //   : (unreadCount && unreadCount[room.chatRoomId] > 0
                        //       ? '#166534'
                        //       : (isDarkMode ? '#fff' : 'var(--color-text)')),
                      }}
                    >
                      {lastMessage.sender?.id === user?.id
                        ? "You"
                        : lastMessage.sender?.username}
                    </span>
                    <span style={{ color: "grey" }}>
                      :{" "}
                      {(() => {
                        const maxLen = compactView ? 30 : 40;
                        const content = lastMessage.content || "";
                        return content.length > maxLen
                          ? content.slice(0, maxLen - 3) + "..."
                          : content;
                      })()}
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      color: "grey",
                      // unreadCount && unreadCount[room.chatRoomId] > 0
                      //   ? "#166534"
                      //   : "grey",
                    }}
                  >
                    {(() => {
                      const maxLen = compactView ? 30 : 40;
                      const content = lastMessage.content || "";
                      return content.length > maxLen
                        ? content.slice(0, maxLen - 3) + "..."
                        : content;
                    })()}
                  </span>
                )
              ) : (
                <span
                  style={{
                    color: "grey",
                    fontWeight: 400,
                  }}
                >
                  send a message to start a conversation
                </span>
              )}
            </p>
            {/* Unread count badge at the end of the sender/message row */}
            {unreadCount && unreadCount[room.chatRoomId] > 0 && (
              <span className="inline-block rounded-full bg-green-700 text-white text-[10px] font-bold px-2 py-1 min-w-[22px] text-center ml-2">
                {unreadCount[room.chatRoomId]}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Only render the pop-out menu (createPortal) if !isMobileView */}
      {!isMobileView &&
        menuShouldRender &&
        menuPos &&
        createPortal(
          <div
            ref={menuRef}
            className={`fixed z-[9999] w-[140px] bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 flex flex-col border border-gray-200 dark:border-gray-700
            menu-popout${menuVisible ? " menu-popout-in" : " menu-popout-out"}`}
            style={{
              top: menuPos.top,
              left: menuPos.left,
              boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
              transformOrigin: showAbove[room.chatRoomId]
                ? "bottom right"
                : "top right",
            }}
          >
            <button
              onClick={handlePin}
              className="px-4 py-2 text-left hover:bg-[var(--color-primary)] hover:text-white transition-colors text-gray-700 dark:text-gray-300"
            >
              {room.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={handleArchive}
              className="px-4 py-2 text-left hover:bg-yellow-400 hover:text-white transition-colors text-gray-700 dark:text-gray-300"
            >
              Archive
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-left hover:bg-red-500 hover:text-white transition-colors text-gray-700 dark:text-gray-300"
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
