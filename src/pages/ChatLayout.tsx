import { useParams } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ChatRoomList from "../components/ChatRoomList";

export default function ChatLayout() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-900">
      <div className="hidden md:block w-1/4 border-r border-gray-300 p-6 overflow-y-auto bg-white">
        <h1 className="text-3xl mb-6 font-bold">Tech Xperts</h1>
        <p className="text-sm text-gray-500 mb-4">
          Click a chat room to open the conversation.
        </p>
        <ChatRoomList />
      </div>

      <div className="block md:hidden border-b border-gray-300 bg-white p-2 overflow-x-auto whitespace-nowrap">
        <ChatRoomList showDpOnly onSelectChatRoom={() => {}} />
      </div>

      <div className="flex-1 p-0 flex flex-col bg-gray-50 min-h-[50vh]">
        {chatRoomId ? (
          <ChatWindow chatRoomId={chatRoomId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
            <h2 className="text-3xl font-bold">Welcome to SpagChat</h2>
            <p className="text-gray-500 text-lg">
              Select a chat room to start a conversation.
            </p>
            <p className="text-gray-400 text-sm max-w-md">
              You can view your available chat rooms on the left. Click any of
              them to begin chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
