import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { FiLogOut, FiPlus, FiSearch } from "react-icons/fi";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";
import AllUsers from "./AllUsers";

type ChatRoomListProps = {
  showDpOnly?: boolean;
  onSelectChatRoom?: (chatRoomId: string) => void;
  chatRoomId?: string;
  isMobileView: boolean;
};

export default function ChatRoomList({
  showDpOnly = false,
  onSelectChatRoom,
}: ChatRoomListProps) {
  const { chatRooms, getChatRoomsRelatedToUser } = useChatRoom();
  const { user, logout } = useAuth();
  const [showAllUsers, setShowAllUsers] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (user?.id) await getChatRoomsRelatedToUser(user.id);
    };
    fetch();
  }, [user?.id, getChatRoomsRelatedToUser]);

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

  const getRandomColor = (index: number) => colors[index % colors.length];

  const getChatRoomName = (room: ChatRoomType) => {
    if (room.isGroup) return room.name || "Unnamed Group";
    const otherUser = room.users.find((u) => u.id !== user?.id);
    return otherUser ? otherUser.username.slice(0, 4) : "Unknown";
  };

  if (showDpOnly) {
    return (
      <div className="flex items-center space-x-4 overflow-x-auto p-2 scrollbar-hide">
        {chatRooms.map((room, index) => {
          const chatRoomName = getChatRoomName(room);
          const dpLetter = chatRoomName.charAt(0).toUpperCase();
          const bgColor = getRandomColor(index);

          return (
            <button
              key={room.chatRoomId}
              onClick={() =>
                onSelectChatRoom && onSelectChatRoom(room.chatRoomId)
              }
              className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-lg ${bgColor} flex-shrink-0 hover:scale-110 active:scale-95 transition transform duration-200 shadow-md`}
              aria-label={`Open chat room ${chatRoomName}`}
            >
              {dpLetter}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-white relative overflow-hidden">
      {/* Top Bar with Logout and Add */}
      <div className="flex justify-between items-center px-4 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
        {/* Logout Button with Hover Label */}
        <div className="relative group">
          <button
            onClick={logout}
            className="text-gray-600 hover:text-red-500 bg-gray-100 p-2 rounded-full"
          >
            <FiLogOut />
          </button>
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-300 text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 ease-in-out pointer-events-none">
            Logout
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800">
          {showAllUsers ? "All Users" : "Chats"}
        </h3>

        {/* Add Users/Groups Button with Hover Label */}
        <div className="relative group z-[9000]">
          <button
            onClick={() => setShowAllUsers((prev) => !prev)}
            className="text-gray-600 hover:text-green-500 bg-gray-100 p-2 rounded-full"
          >
            <FiPlus />
          </button>
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-300 text-black text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 ease-in-out pointer-events-none whitespace-nowrap">
            {showAllUsers ? "Back to Chats" : "Add User / Join Group"}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      {!showAllUsers && (
        <div className="flex items-center bg-gray-100 mx-4 mt-4 px-3 py-2 rounded-full shadow-sm">
          <FiSearch />
          <input
            type="text"
            placeholder="Search for friends"
            className="bg-transparent outline-none flex-1 text-sm ml-2"
          />
        </div>
      )}

      {/* Scrollable Section */}
      <div className="flex-1 mt-4 px-4 pb-6 overflow-y-auto scrollbar-hide">
        {showAllUsers ? (
          <AllUsers />
        ) : (
          <ul className="space-y-3">
            {chatRooms.map((room, index) => {
              const chatRoomName = getChatRoomName(room);
              const dpLetter = chatRoomName.charAt(0).toUpperCase();
              const bgColor = getRandomColor(index);

              return (
                <Link key={room.chatRoomId} to={`/chat/${room.chatRoomId}`}>
                  <li className="flex items-start gap-4 p-3 rounded-xl bg-white shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <div
                      className={`w-14 h-14 flex items-center justify-center rounded-full text-white font-bold text-xl ${bgColor} flex-shrink-0`}
                    >
                      {dpLetter}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800 text-base truncate">
                          {chatRoomName}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm truncate italic">
                        {room.lastMessageContent
                          ? `${room.lastMessageContent.slice(0, 40)}...`
                          : "No messages yet"}
                      </p>
                    </div>
                  </li>
                </Link>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
