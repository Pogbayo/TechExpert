import { ChatRoomProvider } from "../context/ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../context/ChatRoomUserContextFolder/ChatRoomUserContext";
// import { ChatUIProvider } from "../context/ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../context/MessageContextFolder/MessageContext";
import { SignalProvider } from "../context/SignalRContextFolder/SignalRContext";
import { UserProvider } from "../context/UserContextFolder/UserContext";
import { OnlineUsersProvider } from "../context/OnlineUsersContext";
import { ProfileProvider } from "../context/ProfileContextFolder/ProfileContext";
import { ThemeProvider } from "../context/ThemeContextFoler/ThemeContext";
import { AuthProvider } from "../context/AuthContextFolder/AuthContext";
interface InnerProvidersProps {
  children: React.ReactNode;
  userId: string;
}

export default function InnerProviders({
  children,
  userId,
}: InnerProvidersProps) {
  return (
    <AuthProvider>
      <ThemeProvider>
        {userId ? (
          <SignalProvider userId={userId}>
            <MessageProvider>
              <ChatRoomProvider userId={userId}>
                <UserProvider>
                  <ChatRoomUserProvider>
                    <OnlineUsersProvider>
                      <ProfileProvider userId={userId}>
                        {children}
                      </ProfileProvider>
                    </OnlineUsersProvider>
                  </ChatRoomUserProvider>
                </UserProvider>
              </ChatRoomProvider>
            </MessageProvider>
          </SignalProvider>
        ) : (
          <MessageProvider>
            <ChatRoomProvider userId={userId}>
              <UserProvider>
                <ChatRoomUserProvider>
                  <OnlineUsersProvider>
                    <ProfileProvider userId={userId}>
                      {children}
                    </ProfileProvider>
                  </OnlineUsersProvider>
                </ChatRoomUserProvider>
              </UserProvider>
            </ChatRoomProvider>
          </MessageProvider>
        )}
      </ThemeProvider>
    </AuthProvider>
  );
}
