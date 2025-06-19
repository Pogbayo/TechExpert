import { Link } from "react-router-dom";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import type { ChatRoomType } from "../Types/EntityTypes/ChatRoom";

export default function ChatRoomList() {
  const { chatRooms, getChatRoomsRelatedToUser } = useChatRoom();
  const { user } = useAuth();
  useEffect(() => {
    const handleFetchChatRooms = async () => {
      if (user?.id) {
        await getChatRoomsRelatedToUser(user.id);
      }
    };
    handleFetchChatRooms();
  }, [user?.id, getChatRoomsRelatedToUser]);

  const colors = [
    "bg-red-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
  ];

  const getRandomColor = (index: number) => {
    return colors[index % colors.length];
  };

  const getChatRoomName = (room: ChatRoomType) => {
    console.log("Room Users:", room.users);
    console.log("Current User ID:", user?.id);
    if (room.isGroup) {
      return room.name || "Unnamed Group";
    } else {
      if (Array.isArray(room.users) && room.users.length > 0) {
        const otherUser = room.users.find((u) => u.id !== user?.id);
        console.log("Other user found:", otherUser);
        return otherUser ? otherUser.username.slice(0, 4) : "Unknown";
      } else {
        return "Unknown";
      }
    }
  };

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
                  className="text-blue-600 hover:underline font-semibold"
                >
                  {chatRoomName}
                </Link>
                <p className="text-gray-600 text-sm">
                  {room.lastMessageContent || "No messages yet"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
