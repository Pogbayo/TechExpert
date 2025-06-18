import { useParams } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ChatRoomList from "../components/ChatRoomList";
import MutualFriends from "../components/MutualFriends";

export default function ChatLayout() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  return (
    <div className="flex h-screen bg-amber-100">
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <MutualFriends />
      </div>

      <div className="w-2/4 p-4 flex flex-col">
        {chatRoomId ? (
          <ChatWindow chatRoomId={chatRoomId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>This is the chatRoom fallback if chatWindowId is null</p>
            <p className="">Select a chat room to start messaging</p>
          </div>
        )}
      </div>

      <div className="w-1/4 border-l p-4 overflow-y-auto">
        <ChatRoomList />
      </div>
    </div>
  );
}
