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
// import { useMessage } from "../MessageContextFolder/useMessage";

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
    return stored ? JSON.parse(stored) : [];
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

  // const { fetchMessagesByChatRoomId } = useMessage();

  useEffect(() => {
    if (chatRoom) {
      localStorage.setItem(CHAT_ROOM_STORAGE_KEY, JSON.stringify(chatRoom));
    } else {
      localStorage.removeItem(CHAT_ROOM_STORAGE_KEY);
    }
  }, [chatRoom]);

  useEffect(() => {
    localStorage.setItem(CHAT_ROOMS_STORAGE_KEY, JSON.stringify(chatRooms));
  }, [chatRooms]);

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
      const room = chatRooms.find((room) => room.chatRoomId === chatRoomId);
      if (room) {
        setChatRoom(room);
      }
    },
    [chatRooms]
  );

  // --- SignalR Event Handlers ---
  const handleNewChatRoom = useCallback(
    (chatRoom: ChatRoomType) => {
      // Check if the current user is a member of this chat room
      if (chatRoom.users && chatRoom.users.some((u) => u.id === user?.id)) {
        setChatRooms((prev) => {
          const exists = prev.some((r) => r.chatRoomId === chatRoom.chatRoomId);
          if (exists) {
            // Update existing room if it already exists
            return prev.map((r) =>
              r.chatRoomId === chatRoom.chatRoomId ? { ...r, ...chatRoom } : r
            );
          }
          // Add new
          // Show toast only for newly added rooms
          // toast.success(
          //   `You've been added to ${chatRoom.name || "a new chat room"}!`
          // );
          return [...prev, chatRoom];
        });
        // Join the SignalR group for this chat room
        if (connection) {
          connection.invoke("JoinRoom", chatRoom.chatRoomId).catch((err) => {
            console.error("Failed to join new chat room group:", err);
          });
        }
      }
    },
    [user, connection]
  );

  const handleChatRoomUpdated = useCallback(
    (chatRoomId: string, newName: string) => {
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
    setChatRooms((prev) => {
      const exists = prev.some((room) => room.chatRoomId === chatRoomId);
      const updated = prev.filter((room) => room.chatRoomId !== chatRoomId);
      // Only show toast if the room was actually removed
      if (exists) {
        toast.error("A chat room you were in has been deleted.");
      }
      return updated;
    });
    setLastAction("chatroom-deleted");
  }, []);

  useEffect(() => {
    if (!connection) return;
    connection.on("ChatRoomCreated", handleNewChatRoom);
    connection.on("ChatRoomUpdated", handleChatRoomUpdated);
    connection.on("ChatRoomDeleted", handleChatRoomDeleted);
    return () => {
      connection.off("ChatRoomCreated", handleNewChatRoom);
      connection.off("ChatRoomUpdated", handleChatRoomUpdated);
      connection.off("ChatRoomDeleted", handleChatRoomDeleted);
    };
  }, [
    connection,
    handleNewChatRoom,
    handleChatRoomUpdated,
    handleChatRoomDeleted,
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

  // fetch chat rooms from server on login/page load to avoid stale localStorage
  useEffect(() => {
    if (user?.id) {
      getChatRoomsRelatedToUser(user.id);
    }
    // Optionally, clear chatRooms if user logs out
    if (!user?.id) {
      setChatRooms([]);
      localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);
    }
  }, [user?.id, getChatRoomsRelatedToUser]);

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
        currentChatRoomId,
        setCurrentChatRoomId,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
}
