import { Link } from "react-router-dom";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";

type ChatRoomListProps = {
  showDpOnly?: boolean;
  onSelectChatRoom?: (chatRoomId: string) => void;
};

export default function ChatRoomList({
  showDpOnly = false,
  onSelectChatRoom,
}: ChatRoomListProps) {
  const { chatRooms, getChatRoomsRelatedToUser } = useChatRoom();
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  useEffect(() => {
    const handleFetchChatRooms = async () => {
      if (user?.id) {
        await getChatRoomsRelatedToUser(user.id);
      }
    };
    console.log(token);
    handleFetchChatRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, getChatRoomsRelatedToUser]);

  const colors = [
    "bg-gray-500",
    "bg-gray-600",
    "bg-gray-700",
    "bg-slate-500",
    "bg-slate-600",
    "bg-slate-700",
    "bg-stone-500",
    "bg-stone-600",
    "bg-stone-700",
    "bg-neutral-500",
    "bg-neutral-600",
    "bg-neutral-700",
    "bg-zinc-500",
    "bg-zinc-600",
    "bg-zinc-700",
    "bg-blue-400",
    "bg-indigo-400",
    "bg-emerald-400",
    "bg-teal-400",
    "bg-cyan-400",
    "bg-rose-400",
    "bg-amber-400",
  ];

  const getRandomColor = (index: number) => {
    return colors[index % colors.length];
  };

  const getChatRoomName = (room: ChatRoomType) => {
    if (room.isGroup) {
      return room.name || "Unnamed Group";
    } else {
      if (Array.isArray(room.users) && room.users.length > 0) {
        const otherUser = room.users.find((u) => u.id !== user?.id);
        return otherUser ? otherUser.username.slice(0, 4) : "Unknown";
      } else {
        return "Unknown";
      }
    }
  };

  if (showDpOnly) {
    return (
      <div className="flex space-x-4">
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
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg ${bgColor} flex-shrink-0`}
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
    <div>
      <h3 className="text-lg font-bold mb-4">Chat Rooms</h3>
      <ul>
        {chatRooms.map((room, index) => {
          const chatRoomName = getChatRoomName(room);
          const dpLetter = chatRoomName.charAt(0).toUpperCase();
          const bgColor = getRandomColor(index);

          return (
            <li key={room.chatRoomId} className="flex items-center mb-4 gap-4">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold text-lg ${bgColor}`}
              >
                {dpLetter}
              </div>

              <div>
                <Link
                  to={`/chat/${room.chatRoomId}`}
                  className=" hover:underline font-semibold"
                >
                  {chatRoomName}
                </Link>
                <p className="text-gray-600 text-sm">
                  {room.lastMessageContent
                    ? `${room.lastMessageContent.slice(0, 20)}...`
                    : "No Messages yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
