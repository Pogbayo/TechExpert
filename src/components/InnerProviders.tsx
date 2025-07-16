import { ChatRoomProvider } from "../context/ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../context/ChatRoomUserContextFolder/ChatRoomUserContext";
// import { ChatUIProvider } from "../context/ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../context/MessageContextFolder/MessageContext";
import { SignalProvider } from "../context/SignalRContextFolder/SignalRContext";
import { UserProvider } from "../context/UserContextFolder/UserContext";
import { OnlineUsersProvider } from "../context/OnlineUsersContext";
import { ProfileProvider } from "../context/ProfileContextFolder/ProfileContext";
import { ThemeProvider } from "../context/ThemeContextFoler/ThemeContext";
interface InnerProvidersProps {
  children: React.ReactNode;
  userId: string;
}

export default function InnerProviders({
  children,
  userId,
}: InnerProvidersProps) {
  return (
    <ThemeProvider>
      <SignalProvider userId={userId}>
        <MessageProvider>
          <ChatRoomProvider>
            <UserProvider>
              <ChatRoomUserProvider>
                <OnlineUsersProvider>
                  <ProfileProvider>
                    {children}
                  </ProfileProvider>
                </OnlineUsersProvider>
              </ChatRoomUserProvider>
            </UserProvider>
          </ChatRoomProvider>
        </MessageProvider>
      </SignalProvider>
    </ThemeProvider>
  );
}
