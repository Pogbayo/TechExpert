import { useParams } from "react-router-dom";
import ChatWindow from "../components/ChatWindow";
import ChatRoomList from "../components/ChatRoomList";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useEffect } from "react";
import { useWindowSize } from "../components/useWindowSize";

export default function ChatLayout() {
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { getChatRoomById, chatRoom } = useChatRoom();
  const windowSize = useWindowSize();

  const isMobileView = windowSize <= 700;

  useEffect(() => {
    const handleFetchChatRoom = async () => {
      if (chatRoomId) {
        await getChatRoomById(chatRoomId);
      }
    };
    handleFetchChatRoom();
  }, [chatRoomId, getChatRoomById]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 text-gray-900">
      {/* Chat List */}
      {!isMobileView || (isMobileView && !chatRoomId) ? (
        <div
          className={`w-full md:w-1/4 border-r border-gray-300 overflow-y-auto bg-white`}
        >
          <h1 className="text-3xl mb-6 font-bold px-4">Spag Chat</h1>
          {isMobileView ? null : (
            <p className="text-sm text-gray-500 mb-4 px-4">
              Click a chat room to open the conversation.
            </p>
          )}
          <ChatRoomList isMobileView={isMobileView} chatRoomId={chatRoomId} />
        </div>
      ) : null}

      {/* Chat Window */}
      {!isMobileView || (isMobileView && chatRoomId) ? (
        <div className="flex-1 p-0 flex flex-col bg-gray-50 min-h-[50vh]">
          {chatRoomId && chatRoom ? (
            <ChatWindow chatRoom={chatRoom} />
          ) : !isMobileView ? (
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
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
