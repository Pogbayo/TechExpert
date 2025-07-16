import {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import type { ChatRoomContextType } from "../../Types/ContextTypes/contextType";
import type { ChatRoomType } from "../../Types/EntityTypes/ChatRoom";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import { useSignal } from "../SignalRContextFolder/useSignalR";
import axiosInstance from "../../IAxios/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../AuthContextFolder/useAuth";
import * as signalR from "@microsoft/signalr";
import { useMessage } from "../MessageContextFolder/useMessage";

// eslint-disable-next-line react-refresh/only-export-components
export const ChatRoomContext = createContext<ChatRoomContextType | undefined>(
  undefined
);

const CHAT_ROOM_STORAGE_KEY = "chatRoom";
const CHAT_ROOMS_STORAGE_KEY = "chatRooms";

export function ChatRoomProvider({ children }: { children: ReactNode }) {
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(() => {
    const stored = localStorage.getItem(CHAT_ROOM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>(() => {
    const stored = localStorage.getItem(CHAT_ROOMS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Handle both old format (array) and new format (object with timestamp)
        if (Array.isArray(parsed)) {
          console.log(
            "📦 Loaded chat rooms from localStorage (old format):",
            parsed.length
          );
          return parsed;
        } else if (parsed.chatRooms && Array.isArray(parsed.chatRooms)) {
          console.log("📦 Loaded chat rooms from localStorage (new format):", {
            count: parsed.chatRooms.length,
            timestamp: parsed.timestamp,
            userId: parsed.userId,
          });
          return parsed.chatRooms;
        }
      } catch (error) {
        console.error("❌ Error parsing localStorage chat rooms:", error);
      }
    }
    return [];
  });
  // console.log(chatRooms.length);
  const [chatRoomsThatUserIsNotIn, setChatRoomsThatUserIsNotIn] = useState<
    ChatRoomType[] | null
  >(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(
    null
  );

  // const navigate = useNavigate();
  const { connection } = useSignal();
  const { user } = useAuth();
  const { setCurrentChatRoomId: setMessageContextChatRoomId } = useMessage();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastAction, setLastAction] = useState<
    | "user-added"
    | "user-removed"
    | "chatroom-created"
    | "chatroom-deleted"
    | "chatroom-updated"
    | null
  >(null);

  // Wrapper function to sync both contexts
  const setCurrentChatRoomIdWrapper = useCallback(
    (id: string | null) => {
      console.log("🔄 Syncing currentChatRoomId:", id);
      setCurrentChatRoomId(id);
      setMessageContextChatRoomId(id);
    },
    [setMessageContextChatRoomId]
  );

  // const { fetchMessagesByChatRoomId } = useMessage();

  useEffect(() => {
    if (chatRoom) {
      localStorage.setItem(CHAT_ROOM_STORAGE_KEY, JSON.stringify(chatRoom));
    } else {
      localStorage.removeItem(CHAT_ROOM_STORAGE_KEY);
    }
  }, [chatRoom]);

  useEffect(() => {
    const dataWithTimestamp = {
      chatRooms,
      timestamp: new Date().toISOString(),
      userId: user?.id,
    };
    localStorage.setItem(
      CHAT_ROOMS_STORAGE_KEY,
      JSON.stringify(dataWithTimestamp)
    );
    console.log("💾 Saved chat rooms to localStorage:", {
      count: chatRooms.length,
      timestamp: dataWithTimestamp.timestamp,
      userId: user?.id,
    });
  }, [chatRooms, user?.id]);

  const getChatRoomsRelatedToUser = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<ChatRoomType[]>>(
        `/chatroom/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        }
      );
      if (response.data.success) {
        setChatRooms(response.data.data ?? []);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch chat rooms.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // const openChatRoom = useCallback(
  //   async (chatRoomId: string) => {
  //     await fetchMessagesByChatRoomId(chatRoomId);
  //     navigate(`/chat/${chatRoomId}`);
  //   },
  //   [fetchMessagesByChatRoomId, navigate]
  // );

  const openChatRoom = useCallback(
    async (chatRoomId: string): Promise<void> => {
      console.log("🔍 Opening chat room:", chatRoomId);
      const room = chatRooms.find((room) => room.chatRoomId === chatRoomId);
      if (room) {
        setChatRoom(room);
        setCurrentChatRoomIdWrapper(chatRoomId);
        console.log("✅ Chat room opened:", chatRoomId);
      } else {
        console.log("❌ Chat room not found:", chatRoomId);
      }
    },
    [chatRooms, setCurrentChatRoomIdWrapper]
  );

  // --- SignalR Event Handlers ---
  const handleNewChatRoom = useCallback(
    (chatRoom: ChatRoomType) => {
      console.log("📨 SignalR: New chat room received:", {
        chatRoomId: chatRoom.chatRoomId,
        name: chatRoom.name,
        isGroup: chatRoom.isGroup,
        users: chatRoom.users?.map(u => u.id)
      });
      
      // Check if the current user is a member of this chat room
      if (chatRoom.users && chatRoom.users.some((u) => u.id === user?.id)) {
        setChatRooms((prev) => {
          const exists = prev.some((r) => r.chatRoomId === chatRoom.chatRoomId);
          if (exists) {
            console.log("🔄 Updating existing chat room:", chatRoom.chatRoomId);
            // Update existing room if it already exists
            return prev.map((r) =>
              r.chatRoomId === chatRoom.chatRoomId ? { ...r, ...chatRoom } : r
            );
          }
          console.log("➕ Adding new chat room:", chatRoom.chatRoomId);
          // Add new room
          return [...prev, chatRoom];
        });
        
        // Join the SignalR group for this chat room
        if (connection) {
          connection.invoke("JoinRoom", chatRoom.chatRoomId).catch((err) => {
            console.error("Failed to join new chat room group:", err);
          });
        }
      } else {
        console.log("❌ User not a member of new chat room:", chatRoom.chatRoomId);
      }
    },
    [user, connection]
  );

  const handleChatRoomUpdated = useCallback(
    (chatRoomId: string, newName: string) => {
      console.log("📨 SignalR: Chat room updated:", { chatRoomId, newName });
      setChatRooms((prev) =>
        prev.map((room) =>
          room.chatRoomId === chatRoomId ? { ...room, name: newName } : room
        )
      );
      setLastAction("chatroom-updated");
      toast.success(`Chat room renamed to: ${newName}`);
    },
    []
  );

  const handleChatRoomDeleted = useCallback((chatRoomId: string) => {
    console.log("📨 SignalR: Chat room deleted:", chatRoomId);
    setChatRooms((prev) => {
      const exists = prev.some((room) => room.chatRoomId === chatRoomId);
      const updated = prev.filter((room) => room.chatRoomId !== chatRoomId);
      // Only show toast if the room was actually removed
      if (exists) {
        toast.error("A chat room you were in has been deleted.");
        // Clear localStorage to ensure fresh data on reload
        localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);
        console.log("🧹 Cleared localStorage after chat room deletion");
      }
      return updated;
    });
    setLastAction("chatroom-deleted");
  }, []);

  const handleUserAddedToChatRoom = useCallback((chatRoomId: string, userId: string) => {
    console.log("📨 SignalR: User added to chat room:", { chatRoomId, userId });
    if (userId === user?.id) {
      // Refresh chat rooms to get the updated list
      if (user?.id) {
        getChatRoomsRelatedToUser(user.id);
      }
    }
    setLastAction("user-added");
  }, [user, getChatRoomsRelatedToUser]);

  const handleUserRemovedFromChatRoom = useCallback((chatRoomId: string, userId: string) => {
    console.log("📨 SignalR: User removed from chat room:", { chatRoomId, userId });
    if (userId === user?.id) {
      // Remove the chat room from the list
      setChatRooms((prev) => prev.filter((room) => room.chatRoomId !== chatRoomId));
    }
    setLastAction("user-removed");
  }, [user]);

  useEffect(() => {
    if (!connection) return;
    connection.on("ChatRoomCreated", handleNewChatRoom);
    connection.on("ChatRoomUpdated", handleChatRoomUpdated);
    connection.on("ChatRoomDeleted", handleChatRoomDeleted);
    connection.on("UserAddedToChatRoom", handleUserAddedToChatRoom);
    connection.on("UserRemovedFromChatRoom", handleUserRemovedFromChatRoom);
    return () => {
      connection.off("ChatRoomCreated", handleNewChatRoom);
      connection.off("ChatRoomUpdated", handleChatRoomUpdated);
      connection.off("ChatRoomDeleted", handleChatRoomDeleted);
      connection.off("UserAddedToChatRoom", handleUserAddedToChatRoom);
      connection.off("UserRemovedFromChatRoom", handleUserRemovedFromChatRoom);
    };
  }, [
    connection,
    handleNewChatRoom,
    handleChatRoomUpdated,
    handleChatRoomDeleted,
    handleUserAddedToChatRoom,
    handleUserRemovedFromChatRoom,
  ]);

  const createChatRoom = useCallback(
    async (
      name: string,
      isGroup: boolean,
      memberIds: string[]
    ): Promise<ChatRoomType | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.post<
          ApiResponse<ChatRoomType | null>
        >(`/chatroom`, { name, isGroup, memberIds });
        setLastAction("chatroom-created");
        if (response.data.success && response.data.data) {
          const newRoom = response.data.data;

          // Add the new room to the local state
          setChatRooms((prev) => {
            const exists = prev.some(
              (r) => r.chatRoomId === newRoom.chatRoomId
            );
            if (exists) return prev;
            return [...prev, newRoom];
          });

          // Join the SignalR group for this new chat room
          if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
              await connection.invoke("JoinRoom", newRoom.chatRoomId);
              console.log(
                `Joined SignalR group for chat room: ${newRoom.chatRoomId}`
              );
            } catch (err) {
              console.error(
                "Failed to join SignalR group for new chat room:",
                err
              );
            }
          }

          setShowCreateModal(false);
          openChatRoom(newRoom.chatRoomId);
          toast.success(`${newRoom.name || "Chat room"} created successfully.`);
          return newRoom;
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Failed to create chat room."
          );
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    [openChatRoom, connection]
  );

  const fetchChatRoomsWhereUserIsNotIn = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<ApiResponse<ChatRoomType[]>>(
        `/chatroom/not-in/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        }
      );
      if (response.data.success) {
        setChatRoomsThatUserIsNotIn(response.data.data ?? []);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch chat room.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChatRoomByName = useCallback(
    async (chatRoomName: string): Promise<ChatRoomType | null> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get<ApiResponse<ChatRoomType>>(
          `/chatroom/by-name/${chatRoomName}`
        );
        if (response.data.success) {
          return response.data.data ?? null;
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to fetch chat room.");
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
      return null;
    },
    []
  );

  const getChatRoomById = useCallback(async (chatRoomId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance<ApiResponse<ChatRoomType>>(
        `/chatroom/${chatRoomId}`
      );
      if (response.data.success) {
        setChatRoom(response.data.data ?? null);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch chat room.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteChatRoomAsync = useCallback(async (chatRoomId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/chatrooms/${chatRoomId}`);
      setChatRooms((prev) =>
        prev.filter((room) => room.chatRoomId !== chatRoomId)
      );
      setLastAction("chatroom-deleted");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to delete chat room.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateChatRoomName = useCallback(
    async (chatRoomId: string, newName: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await axios.put(`/api/chatrooms/${chatRoomId}/update-name`, {
          newName,
        });
        setChatRooms((prev) =>
          prev.map((room) =>
            room.chatRoomId === chatRoomId ? { ...room, Name: newName } : room
          )
        );
        setLastAction("chatroom-updated");
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Failed to update chat room name."
          );
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getPrivateChatRoom = useCallback(
    async (
      currentUserId: string,
      friendUserId: string
    ): Promise<ChatRoomType> => {
      setIsLoading(true);
      setError(null);
      try {
        // Try to get existing private chat room , if not create a new one
        const response = await axiosInstance.get<ApiResponse<ChatRoomType>>(
          `/chatroom/get-private-chat`,
          {
            params: {
              currentUserId,
              friendUserId,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const existingRoom = response.data.data;

          // Add to local state if not already present
          setChatRooms((prev) => {
            const exists = prev.some(
              (r) => r.chatRoomId === existingRoom.chatRoomId
            );
            if (exists) return prev;
            return [...prev, existingRoom];
          });

          return existingRoom;
        } else {
          const newRoom = await createChatRoom("", false, [
            currentUserId,
            friendUserId,
          ]);

          if (newRoom) {
            return newRoom;
          } else {
            throw new Error("Failed to create private chat room.");
          }
        }
      } catch (error) {
        setError("Failed to get or create private chat room.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [createChatRoom]
  );

  // Force refresh chat rooms from server (bypass localStorage cache)
  const refreshChatRoomsFromServer = useCallback(
    async (userId: string) => {
      console.log("🔄 Force refreshing chat rooms from server for user:", userId);
      setIsLoading(true);
      setError(null);
      
      try {
        // Clear localStorage first
        localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);
        console.log("🧹 Cleared localStorage chat rooms cache");
        
        // Fetch fresh data from server
        const response = await axiosInstance.get<ApiResponse<ChatRoomType[]>>(
          `/chatroom/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
            },
          }
        );
        
        if (response.data.success) {
          const freshChatRooms = response.data.data ?? [];
          console.log("✅ Refreshed chat rooms from server:", {
            count: freshChatRooms.length,
            rooms: freshChatRooms.map(r => ({ id: r.chatRoomId, name: r.name }))
          });
          setChatRooms(freshChatRooms);
        } else {
          console.error("❌ Failed to refresh chat rooms:", response.data.message);
          setError(response.data.message || "Failed to refresh chat rooms");
        }
      } catch (err: unknown) {
        console.error("❌ Error refreshing chat rooms:", err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || "Failed to refresh chat rooms.");
        } else {
          setError("An unexpected error occurred while refreshing chat rooms.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // fetch chat rooms from server on login/page load to avoid stale localStorage
  useEffect(() => {
    if (user?.id) {
      console.log("🔄 Fetching chat rooms for user:", user.id);
      getChatRoomsRelatedToUser(user.id);
    }
    // Optionally, clear chatRooms if user logs out
    if (!user?.id) {
      setChatRooms([]);
      localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);
    }
  }, [user?.id, getChatRoomsRelatedToUser]);

  // Auto-refresh chat rooms when SignalR connection is established
  useEffect(() => {
    if (connection?.state === signalR.HubConnectionState.Connected && user?.id) {
      console.log("🔗 SignalR connected, refreshing chat rooms");
      // Small delay to ensure connection is fully established
      const timer = setTimeout(() => {
        getChatRoomsRelatedToUser(user.id);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [connection?.state, user?.id, getChatRoomsRelatedToUser]);

  // Periodic refresh every 30 seconds to ensure chatrooms stay up-to-date
  useEffect(() => {
    if (!user?.id || !connection || connection.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    const interval = setInterval(() => {
      console.log("🔄 Periodic chat room refresh");
      getChatRoomsRelatedToUser(user.id);
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user?.id, connection, getChatRoomsRelatedToUser]);

  return (
    <ChatRoomContext.Provider
      value={{
        getPrivateChatRoom,
        fetchChatRoomsWhereUserIsNotIn,
        chatRoomsThatUserIsNotIn,
        openChatRoom,
        chatRoom,
        chatRooms,
        lastAction,
        setLastAction,
        isLoading,
        error,
        createChatRoom,
        getChatRoomsRelatedToUser,
        getChatRoomByName,
        getChatRoomById,
        deleteChatRoomAsync,
        showCreateModal,
        setShowCreateModal,
        updateChatRoomName,
        refreshChatRoomsFromServer,
        currentChatRoomId,
        setCurrentChatRoomId: setCurrentChatRoomIdWrapper,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
}
