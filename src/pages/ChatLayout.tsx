import { useParams } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ChatRoomList from "../components/ChatRoomList";
import MutualFriends from "../components/MutualFriends";

export default function ChatLayout() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      {/* Left Panel - Mutual Friends */}
      <div className="w-1/4 border-r border-gray-300 p-6 overflow-y-auto bg-white">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-300">
          Mutual Friends
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Connect with people you both know.
        </p>
        <MutualFriends />
      </div>

      {/* Middle Panel - Chat Window */}
      <div className="w-2/4 p-6 flex flex-col bg-gray-50">
        {chatRoomId ? (
          <ChatWindow chatRoomId={chatRoomId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <h2 className="text-3xl font-bold">Welcome to SpagChat</h2>
            <p className="text-gray-500 text-lg">
              Select a chat room to start a conversation.
            </p>
            <p className="text-gray-400 text-sm max-w-md">
              You can view your available chat rooms on the right. Click any of
              them to begin chatting.
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Chat Room List */}
      <div className="w-1/4 border-l border-gray-300 p-6 overflow-y-auto bg-white">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2 border-gray-300">
          Available Chat Rooms
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Click a chat room to open the conversation.
        </p>
        <ChatRoomList />
      </div>
    </div>
  );
}
