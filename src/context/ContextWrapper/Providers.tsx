import { AuthProvider } from "../AuthContextFolder/AuthContext";
import { ChatRoomProvider } from "../ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../ChatRoomUserContextFolder/ChatRoomUserContext";
import { ChatUIProvider } from "../ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../MessageContextFolder/MessageContext";
import { SignalProvider } from "../SignalRContextFolder/SignalRContext";
import { UserProvider } from "../UserContextFolder/UserContext";
import type { ProvidersProps } from "../../Types/ContextTypes/contextType";

export default function Providers({ children }: ProvidersProps) {
  return (
    <SignalProvider userId={""}>
      <AuthProvider>
        <UserProvider>
          <ChatRoomProvider>
            <ChatRoomUserProvider>
              <MessageProvider>
                <ChatUIProvider>{children}</ChatUIProvider>
              </MessageProvider>
            </ChatRoomUserProvider>
          </ChatRoomProvider>
        </UserProvider>
      </AuthProvider>
    </SignalProvider>
  );
}
