import { useAuth } from "../context/AuthContextFolder/useAuth";
import { ChatRoomProvider } from "../context/ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../context/ChatRoomUserContextFolder/ChatRoomUserContext";
import { ChatUIProvider } from "../context/ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../context/MessageContextFolder/MessageContext";
import { SignalProvider } from "../context/SignalRContextFolder/SignalRContext";
import { UserProvider } from "../context/UserContextFolder/UserContext";
import { OnlineUsersProvider } from "../context/OnlineUsersContext";
import { ProfileProvider } from "../context/ProfileContextFolder/ProfileContext";

export default function InnerProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  // console.log(user?.id);
  if (!user?.id) return <>{children}</>;

  return (
    <SignalProvider userId={user.id}>
      <UserProvider>
        <MessageProvider>
          <ChatRoomProvider>
            <ChatRoomUserProvider>
              <OnlineUsersProvider>
                <ProfileProvider>
                  <ChatUIProvider>{children}</ChatUIProvider>
                </ProfileProvider>
              </OnlineUsersProvider>
            </ChatRoomUserProvider>
          </ChatRoomProvider>
        </MessageProvider>
      </UserProvider>
    </SignalProvider>
  );
}
