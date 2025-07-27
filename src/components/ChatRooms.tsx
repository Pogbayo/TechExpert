import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContextFolder/useUser";
import { useChatRoom } from "../context/ChatRoomContextFolder/useChatRoom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import { useMessage } from "../context/MessageContextFolder/useMessage";

export default function ChatRooms({
  onUserOrGroupSelected,
  setShowChatWindow,
  isMobileView,
  // isDarkMode,
}: {
  onUserOrGroupSelected?: (chatRoomId: string) => void;
  setShowChatWindow?: (val: boolean) => void;
  isMobileView?: boolean;
  isDarkMode:boolean;
}) {
  // const navigate = useNavigate();

  const { fetchNonMutualFriends, nonMutualFriends, fetchUsers, users } =
    useUser();
  const { setCurrentChatRoomId } = useMessage();
  const { user } = useAuth();
  const {
    getPrivateChatRoom,
    chatRoomsThatUserIsNotIn,
    createChatRoom,
    showCreateModal,
    setShowCreateModal,
  } = useChatRoom();
  const { clearMessages } = useMessage();
  const { openChatRoom } = useChatRoom();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isAddingUser, setIsAddingUser] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await fetchNonMutualFriends(user?.id ?? "");
        await fetchUsers(100);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetchNonMutualFriends, fetchUsers, user?.id]);

  const handleOpenChatRoom = async (userId: string, friendId: string) => {
    setIsAddingUser(true);
    clearMessages();
    const chatRoom = await getPrivateChatRoom(userId, friendId);
    if (chatRoom) {
      console.log("🔗 ChatRooms - Opening private chat:", chatRoom.chatRoomId);
      // The getPrivateChatRoom function now handles setting the current chat room
      if (onUserOrGroupSelected) onUserOrGroupSelected(chatRoom.chatRoomId);
      if (isMobileView && setShowChatWindow) setShowChatWindow(true);
    }
    setIsAddingUser(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    setIsLoading(true);
    if (!groupName.trim()) {
      setError("Group name is required");
      setIsLoading(false);
      return;
    }
    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      setIsLoading(false);
      return;
    }

    setError("");
    if (!user?.id) {
      setError("User ID is missing");
      setIsLoading(false);
      return;
    }

    const memberIds = [user.id, ...selectedUsers];

    const newGroup = await createChatRoom(groupName.trim(), true, memberIds);
    setIsLoading(false);
    if (newGroup) {
      // Set the current chat room and open it
      setCurrentChatRoomId(newGroup.chatRoomId);
      openChatRoom(newGroup.chatRoomId);
      if (isMobileView && setShowChatWindow) setShowChatWindow(true);
      if (onUserOrGroupSelected) onUserOrGroupSelected(newGroup.chatRoomId);
      // navigate(`/chat/${newGroup.chatRoomId}`); // You can remove this if you don't use navigation
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[var(--color-background)] overflow-hidden">
      {/* Tabs */}
      <div className="flex justify-around border-b bg-[var(--color-background)]">
        <button
          onClick={() => setActiveTab("users")}
          className={`py-2 flex-1 text-center ${
            activeTab === "users"
              ? "border-b-2 border-[var(--color-primary)] font-bold text-[var(--color-input-text)]"
              : "text-[var(--color-secondary)]"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`py-2 flex-1 text-center ${
            activeTab === "groups"
              ? "border-b-2 border-[var(--color-primary)] font-bold text-[var(--color-input-text)]"
              : "text-[var(--color-secondary)]"
          }`}
        >
          Groups
        </button>
      </div>

      {activeTab === "groups" && (
        <div className="flex justify-end px-4 mt-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:opacity-90 transition"
          >
            + Create Group
          </button>
        </div>
      )}

      {/* Scrollable List */}
      <div className="flex-1 mt-4 px-4 pb-6 overflow-y-auto scrollbar-hide">
        {isAddingUser && (
          <div className="text-center text-gray-500 mt-4">
            Preparing chat...
          </div>
        )}
        {isLoading ? (
          <div className="text-center text-gray-500 mt-20">
            {activeTab === "users" ? "Loading users..." : "Loading groups..."}
          </div>
        ) : activeTab === "users" ? (
          Array.isArray(nonMutualFriends) && nonMutualFriends.length === 0 ? (
            <div
            className="text-center mt-20 text-gray-500 bg-gray-100 dark:bg-transparent rounded px-4 py-2 inline-block mx-auto">
              There are no non-mutual friends to add.
            </div>
          ) : (
            <ul className="space-y-3">
              {nonMutualFriends?.map((u) => (
                <li
                  key={u.id}
                  onClick={() => handleOpenChatRoom(user?.id ?? "", u.id)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-chat-bg)] shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-400 text-white font-bold text-lg flex-shrink-0">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span 
                      className="font-bold truncate text-sm"
                      style={{
                        color: "var(--color-text)",
                        fontFamily: "var(--font-primary)",
                      }}
                      title={u.username}
                    >
                      {u.username}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (chatRoomsThatUserIsNotIn ?? []).length > 0 ? (
          <ul className="space-y-3">
            {chatRoomsThatUserIsNotIn?.map((group) => (
              <Link key={group.chatRoomId} to={`/chat/${group.chatRoomId}`}>
                <li className="flex items-start gap-4 p-3 rounded-xl bg-[var(--color-chat-bg)] shadow-md cursor-pointer transition-transform duration-200 hover:scale-[1.01] active:scale-[0.98]">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-green-400 text-white font-bold text-xl flex-shrink-0">
                    {group.name?.charAt(0).toUpperCase() || "G"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-base truncate dark:text-white text-[var(--color-text)]">
                      {group.name || "Unnamed Group"}
                    </span>
                    <p className="text-sm italic truncate dark:text-white text-[var(--color-chat-text)]">
                      {group.lastMessageContent
                        ? `${group.lastMessageContent.slice(0, 40)}...`
                        : "No messages yet"}
                    </p>
                  </div>
                </li>
              </Link>
            ))}
          </ul>
        ) : (
          <div className="text-center mt-20 text-gray-500">
            There are no groups available to join.
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md rounded-2xl shadow-xl p-6"
              style={{
                backgroundColor: "var(--color-background)",
                color: "var(--color-text)",
              }}
            >
              <h2 className="text-xl font-semibold mb-4 text-center">
                Create a New Group
              </h2>

              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--color-input-bg)",
                  color: "var(--color-input-text)",
                  border: "1px solid var(--color-border)",
                }}
              />

              <div
                className="max-h-64 overflow-y-auto rounded-lg p-2 space-y-2"
                style={{
                  backgroundColor: "var(--color-chat-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <p>Select users to add</p>
                {users
                  .filter((u) => u.id !== user?.id)
                  .map((u) => {
                    const isSelected = selectedUsers.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleUserSelection(u.id)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-blue-100 border border-blue-400"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-[var(--color-text)]">
                          {u.username}
                        </span>
                      </div>
                    );
                  })}
              </div>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setGroupName("");
                    setShowCreateModal(false);
                    setSelectedUsers([]);
                  }}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {isLoading ? "Preparing group chat..." : "Create Group chat"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
