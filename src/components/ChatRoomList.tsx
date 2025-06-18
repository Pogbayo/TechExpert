import { Link } from "react-router-dom";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";

export default function ChatRoomList() {
  const { chatRooms } = useChatRoom();

  return (
    <div>
      <h3 className="text-lg font-bold mb-4">Chat Rooms</h3>
      <ul>
        {chatRooms.map((room) => (
          <li key={room.ChatRoomId} className="mb-2">
            <Link
              to={`/chat/${room.ChatRoomId}`}
              className="text-blue-600 hover:underline"
            >
              {room.Name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
