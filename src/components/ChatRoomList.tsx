import { Link } from "react-router-dom";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { useMessage } from "../context/MessageContextFolder/useMessage";
import { FiLogOut } from "react-icons/fi";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";

type ChatRoomListProps = {
  showDpOnly?: boolean;
  onSelectChatRoom?: (chatRoomId: string) => void;
  chatRoomId?: string;
  isMobileView?: boolean;
};

export default function ChatRoomList({
  showDpOnly = false,
  onSelectChatRoom,
  isMobileView,
}: ChatRoomListProps) {
  const { chatRooms, getChatRoomsRelatedToUser } = useChatRoom();
  const { user, logout } = useAuth();
  const { lastMessage } = useMessage();

  useEffect(() => {
    const handleFetchChatRooms = async () => {
      if (user?.id) {
        await getChatRoomsRelatedToUser(user.id);
      }
    };
    handleFetchChatRooms();
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
      <div className="flex items-center space-x-4 overflow-x-auto p-2">
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
    <div
      className={`flex flex-col ${
        isMobileView ? "h-screen" : "h-full"
      } justify-between overflow-auto scrollbar-hide w-full`}
    >
      {/* Header */}
      <div className="mb-4 px-4">
        <h3 className="text-lg font-bold mb-4">Chat Rooms</h3>
        <ul className="space-y-3">
          {chatRooms.map((room, index) => {
            const chatRoomName = getChatRoomName(room);
            const dpLetter = chatRoomName.charAt(0).toUpperCase();
            const bgColor = getRandomColor(index);

            return (
              <Link
                key={room.chatRoomId}
                to={`/chat/${room.chatRoomId}`}
                className="block w-full"
              >
                <li className="flex w-full items-center px-4 py-3 rounded-lg hover:bg-gray-100 transition cursor-pointer gap-4 shadow-sm hover:shadow-md">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-white font-bold text-xl ${bgColor} flex-shrink-0`}
                  >
                    {dpLetter}
                  </div>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-gray-800 text-[clamp(1rem, 2.5vw, 1.5rem)]">
                      {chatRoomName}
                    </span>
                    {room.lastMessageContent !== lastMessage ? (
                      <p className="text-gray-500 text-sm truncate italic w-full">
                        {lastMessage}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm truncate italic w-full">
                        {room.lastMessageContent
                          ? `${room.lastMessageContent.slice(0, 25)}...`
                          : "No messages yet"}
                      </p>
                    )}
                  </div>
                </li>
              </Link>
            );
          })}
        </ul>
      </div>

      {/* Logout Button */}
      <div className="px-4">
        <button
          onClick={() => logout()}
          className="flex items-center mb-7 text-sm text-gray-600 hover:text-red-500"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
