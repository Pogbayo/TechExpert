import { useAuth } from "../context/AuthContextFolder/useAuth";
import { ChatRoomProvider } from "../context/ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../context/ChatRoomUserContextFolder/ChatRoomUserContext";
import { ChatUIProvider } from "../context/ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../context/MessageContextFolder/MessageContext";
import { SignalProvider } from "../context/SignalRContextFolder/SignalRContext";
import { UserProvider } from "../context/UserContextFolder/UserContext";
export default function InnerProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  console.log(user?.id);
  if (!user?.id) return <>{children}</>;

  return (
    <SignalProvider userId={user.id}>
      <UserProvider>
        <MessageProvider>
          <ChatRoomProvider>
            <ChatRoomUserProvider>
              <ChatUIProvider>{children}</ChatUIProvider>
            </ChatRoomUserProvider>
          </ChatRoomProvider>
        </MessageProvider>
      </UserProvider>
    </SignalProvider>
  );
}
