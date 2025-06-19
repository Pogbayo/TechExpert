import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useChatRoomUser } from "../context/ChatRoomUserContextFolder/useChatRoomUser";
import { useAuth } from "../context/AuthContextFolder/useAuth";

export default function MutualFriends() {
  const { chatRoomUsers } = useChatRoomUser();
  const { openChatRoom } = useChatRoom();
  const { getPrivateChatRoom } = useChatRoom();
  const { user } = useAuth();

  const handleOpenChat = async (friendUserId: string) => {
    if (!user) return;
    const privateChatRoomId = await getPrivateChatRoom(user?.id, friendUserId);
    if (privateChatRoomId) {
      openChatRoom(privateChatRoomId);
    }
  };

  return (
    <div>
      <h3>Mutual Friends</h3>
      <ul>
        {chatRoomUsers.map((friend, idx) => (
          <>
            <li key={idx} onClick={() => handleOpenChat(friend.id)}>
              {friend.username}
            </li>
          </>
        ))}
      </ul>
    </div>
  );
}
