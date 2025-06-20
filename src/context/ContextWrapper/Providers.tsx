// Providers.tsx
import { ChatRoomProvider } from "../ChatRoomContextFolder/ChatRoomContext";
import { ChatRoomUserProvider } from "../ChatRoomUserContextFolder/ChatRoomUserContext";
import { ChatUIProvider } from "../ChatUIContextFolder/ChatUIContext";
import { MessageProvider } from "../MessageContextFolder/MessageContext";
import { SignalProvider } from "../SignalRContextFolder/SignalRContext";
import { UserProvider } from "../UserContextFolder/UserContext";
import type { ProvidersProps } from "../../Types/ContextTypes/contextType";
import { useAuth } from "../AuthContextFolder/useAuth";

export default function Providers({ children }: ProvidersProps) {
  const { user } = useAuth();

  return (
    <SignalProvider userId={user?.id ?? ""}>
      <UserProvider>
        <ChatRoomProvider>
          <ChatRoomUserProvider>
            <MessageProvider>
              <ChatUIProvider>{children}</ChatUIProvider>
            </MessageProvider>
          </ChatRoomUserProvider>
        </ChatRoomProvider>
      </UserProvider>
    </SignalProvider>
  );
}
