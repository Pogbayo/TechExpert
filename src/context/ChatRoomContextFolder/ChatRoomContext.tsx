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
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../IAxios/axiosInstance";

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

  const navigate = useNavigate();
  const { connection } = useSignal();

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
        console.log(chatRooms);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createChatRoom = useCallback(
    async (name: string, isGroup: boolean, memberIds: string[]) => {
      setIsLoading(true);
      setError(null);
      try {
        await axiosInstance.post(`/api/chatroom`, { name, isGroup, memberIds });
        setLastAction("chatroom-created");
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
    },
    []
  );

  const getChatRoomByName = useCallback(async (chatRoomName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<ChatRoomType>>(
        `/api/chatrooms/name/${chatRoomName}`
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

  const getChatRoomById = useCallback(async (chatRoomId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<ChatRoomType>>(
        `/api/chatrooms/${chatRoomId}`
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

  const openChatRoom = useCallback(
    async (chatRoomId: string) => {
      navigate(`/chat/${chatRoomId}`);
    },
    [navigate]
  );

  const getPrivateChatRoom = useCallback(
    async (currentUserId: string, friendUserId: string): Promise<string> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<ApiResponse<ChatRoomType>>(
          `/api/chatroom/get-private-chat`,
          {
            params: {
              currentUserId,
              friendUserId,
            },
          }
        );
        if (response.data.success && response.data.data) {
          return response.data.data.chatRoomId;
        } else {
          throw new Error("Failed to get private chat room.");
        }
      } catch (error) {
        setError("Failed to get private chat room.");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!connection) return;

    const handleChatRoomCreated = (newChatRoom: ChatRoomType) => {
      console.log("Chat room created: ", newChatRoom);
      const userId = localStorage.getItem("userId");
      if (userId) {
        getChatRoomsRelatedToUser(userId);
      }
      setLastAction("chatroom-created");
    };

    const handleChatRoomUpdated = (chatRoomId: string, newName: string) => {
      setChatRooms((prev) =>
        prev.map((room) =>
          room.chatRoomId === chatRoomId ? { ...room, Name: newName } : room
        )
      );
      setLastAction("chatroom-updated");
    };

    const handleChatRoomDeleted = (chatRoomId: string) => {
      setChatRooms((prev) =>
        prev.filter((room) => room.chatRoomId !== chatRoomId)
      );
      setLastAction("chatroom-deleted");
    };

    connection.on("ChatRoomCreated", handleChatRoomCreated);
    connection.on("ChatRoomUpdated", handleChatRoomUpdated);
    connection.on("ChatRoomDeleted", handleChatRoomDeleted);

    return () => {
      connection.off("ChatRoomCreated", handleChatRoomCreated);
      connection.off("ChatRoomUpdated", handleChatRoomUpdated);
      connection.off("ChatRoomDeleted", handleChatRoomDeleted);
    };
  }, [connection, getChatRoomsRelatedToUser]);

  return (
    <ChatRoomContext.Provider
      value={{
        getPrivateChatRoom,
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
        updateChatRoomName,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
}
