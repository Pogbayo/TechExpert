import { useAuth } from "../context/AuthContextFolder/useAuth";
import { ChatRoomProvider } from "../context/ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../context/ChatRoomUserContextFolder/ChatRoomUserContext";
// import { ChatUIProvider } from "../context/ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../context/MessageContextFolder/MessageContext";
import { SignalProvider } from "../context/SignalRContextFolder/SignalRContext";
import { UserProvider } from "../context/UserContextFolder/UserContext";
import { OnlineUsersProvider } from "../context/OnlineUsersContext";
import { ProfileProvider } from "../context/ProfileContextFolder/ProfileContext";
import { ThemeProvider } from "../context/ThemeContextFoler/ThemeContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
export default function InnerProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  // console.log(user?.id);
  if (!user?.id) {
    return (
      <div style={{ padding: "2rem" }}>
        <Skeleton height={20} width={200} />
        <Skeleton height={20} width={150} style={{ marginTop: 10 }} />
      </div>
    );
  }
  return (
    <ThemeProvider>
      <SignalProvider userId={user.id}>
        <UserProvider>
          <MessageProvider>
            <ChatRoomProvider>
              <ChatRoomUserProvider>
                <OnlineUsersProvider>
                  <ProfileProvider>
                    {children}
                    {/* <ChatUIProvider>{children}</ChatUIProvider> */}
                  </ProfileProvider>
                </OnlineUsersProvider>
              </ChatRoomUserProvider>
            </ChatRoomProvider>
          </MessageProvider>
        </UserProvider>
      </SignalProvider>
    </ThemeProvider>
  );
}
