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
// import { useAuth } from "../AuthContextFolder/useAuth";
import * as signalR from "@microsoft/signalr";
import { useMessage } from "../MessageContextFolder/useMessage";
import { useTheme } from "../ThemeContextFoler/useTheme";
import type { Message } from "../../Types/EntityTypes/Message";

// eslint-disable-next-line react-refresh/only-export-components
export const ChatRoomContext = createContext<ChatRoomContextType | undefined>(
  undefined
);

const CHAT_ROOM_STORAGE_KEY = "chatRoom";
const CHAT_ROOMS_STORAGE_KEY = "chatRooms";

export function ChatRoomProvider({ children, userId }: { children: ReactNode, userId: string }) {
  const [chatRoom, setChatRoom] = useState<ChatRoomType | null>(() => {
    const stored = localStorage.getItem(CHAT_ROOM_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const [chatRooms, setChatRooms] = useState<ChatRoomType[]>(() => {
    const stored = localStorage.getItem(CHAT_ROOMS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed.chatRooms && Array.isArray(parsed.chatRooms)) {
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
    () => {
      return localStorage.getItem("currentChatRoomId") || null;
    }
  );
  const { isDarkMode } = useTheme();
  // const navigate = useNavigate();
  const { connection } = useSignal();
  // const { user } = useAuth();
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

  const UNREAD_COUNT_STORAGE_KEY = "unreadCount";

  const [unreadCount, setUnreadCount] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem(UNREAD_COUNT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(UNREAD_COUNT_STORAGE_KEY, JSON.stringify(unreadCount));
  }, [unreadCount]);



  // Wrapper function to sync both contexts
  const setCurrentChatRoomIdWrapper = useCallback(
    (id: string | null) => {
      setCurrentChatRoomId(id);
      setMessageContextChatRoomId(id);
      if (id) {
        localStorage.setItem("currentChatRoomId", id);
      } else {
        localStorage.removeItem("currentChatRoomId");
      }
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
      userId: userId,
    };
    localStorage.setItem(
      CHAT_ROOMS_STORAGE_KEY,
      JSON.stringify(dataWithTimestamp)
    );
  }, [chatRooms, userId]);

  useEffect(() => {
    if (currentChatRoomId) {
      localStorage.setItem("currentChatRoomId", currentChatRoomId);
    } else {
      localStorage.removeItem("currentChatRoomId");
    }
  }, [currentChatRoomId]);


  const getUnreadMessagesCount = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get<
        ApiResponse<Record<string, number>>
      >(`/chatroom/unread-counts`, {
        params: { userId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        },
      });
      if (response.data.success) {
        setUnreadCount(response.data.data ?? {});
        localStorage.setItem(
          UNREAD_COUNT_STORAGE_KEY,
          JSON.stringify(response.data.data ?? {})
        );
        // console.log(unreadCount);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to fetch unread counts."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getUnreadMessagesCount(userId);
  }, [getUnreadMessagesCount, userId]);

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

  const markAsRead = useCallback(
    async (
      messageIds: string[],
      userId: string) 
      : Promise<ApiResponse<boolean> | undefined> => {
      try {
        const response = await axiosInstance.post<ApiResponse<boolean>>(
          `/chatroom/mark-as-read`,
          {
            messageIds,
            userId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
            },
          }
        );
        if (response.data.success) {
          return response.data;
          };
        }
       catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || "Error marking messages as read."
          );
        } else {
          setError("An unexpected error occurred.");
        }
      }
    },
    []
  );

  // const openChatRoom = useCallback(
  //   async (chatRoomId: string) => {
  //     await fetchMessagesByChatRoomId(chatRoomId);
  //     navigate(`/chat/${chatRoomId}`);
  //   },
  //   [fetchMessagesByChatRoomId, navigate]
  // );

const handleUnReadCountUpdate = useCallback((message:Message)=>{
   setUnreadCount((prev)=>{
    if(
      message.isDeleted ||
      message.sender?.id === userId ||
      message.readBy?.includes(userId) || 
      currentChatRoomId === message.chatRoomId
    ) {
        return prev;
    }
    const updated = {
      ...prev,
      [message.chatRoomId]: (prev[message.chatRoomId] || 0) + 1,
    }; 
    localStorage.setItem(UNREAD_COUNT_STORAGE_KEY,JSON.stringify(updated));
    return updated;
    })
  }, [currentChatRoomId,userId])

  useEffect(() => {
    if (!connection) return;
    connection.on("ReceiveMessage", handleUnReadCountUpdate);
    return () => {
      connection.off("ReceiveMessage", handleUnReadCountUpdate);
    };
  }, [connection, handleUnReadCountUpdate]);
  
  const openChatRoom = useCallback(
    async (chatRoomId: string): Promise<void> => {
      const room = chatRooms.find((room) => room.chatRoomId === chatRoomId);
      if (room) {
        setChatRoom(room);
        setCurrentChatRoomIdWrapper(chatRoomId);
      } else {
        console.log("");
      }
    },
    [chatRooms, setCurrentChatRoomIdWrapper]
  );
  // --- SignalR Event Handlers ---
  const handleNewChatRoom = useCallback(
    (chatRoom: ChatRoomType) => {
      if (chatRoom.users && chatRoom.users.some((u) => u.id === userId)) {
        setChatRooms((prev) => {
          const exists = prev.some((r) => r.chatRoomId === chatRoom.chatRoomId);
          if (exists) {
            return prev.map((r) =>
              r.chatRoomId === chatRoom.chatRoomId ? { ...r, ...chatRoom } : r
            );
          }
          return [...prev, chatRoom];
        });

        if (connection) {
          connection.invoke("JoinRoom", chatRoom.chatRoomId).catch((err) => {
            console.error("Failed to join new chat room group:", err);
          });
        }
      } else {
        toast.error("Failed to join group");
      }
    },
    [userId, connection]
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
      if (exists) {
        toast.error("A chat room you were in has been deleted.");
        localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);
      }
      return updated;
    });
    setLastAction("chatroom-deleted");
  }, []);
  //not yet implemented
  const handleUserAddedToChatRoom = useCallback(
    (chatRoomId: string, userId: string) => {
      if (userId === userId) {
        if (userId) {
          getChatRoomsRelatedToUser(userId);
        }
      }
      setLastAction("user-added");
      chatRoomId.codePointAt(4);
    },
    [userId, getChatRoomsRelatedToUser]
  );
  //not yet implemented
  const handleUserRemovedFromChatRoom = useCallback(
    (chatRoomId: string, userId: string) => {
      if (userId === userId) {
        // Remove the chat room from the list
        setChatRooms((prev) =>
          prev.filter((room) => room.chatRoomId !== chatRoomId)
        );
      }
      setLastAction("user-removed");
    },
    [userId]
  );
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

          if (connection?.state === signalR.HubConnectionState.Connected) {
            try {
              await connection.invoke("JoinRoom", newRoom.chatRoomId);
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
      setUnreadCount((prev) => {
        const updated = { ...prev };
        delete updated[chatRoomId];
        localStorage.setItem(UNREAD_COUNT_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
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
            room.chatRoomId === chatRoomId ? { ...room, name: newName } : room
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
  const pinChatRoom = useCallback(async (chatRoomId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, work locally without backend API
      // TODO: Implement backend API endpoint for pinning

      // Update local state
      setChatRooms((prev) =>
        prev.map((room) =>
          room.chatRoomId === chatRoomId ? { ...room, pinned: true } : room
        )
      );

      // Save to localStorage
      const pinnedRooms = JSON.parse(
        localStorage.getItem("pinnedChatRooms") || "[]"
      );
      if (!pinnedRooms.includes(chatRoomId)) {
        pinnedRooms.push(chatRoomId);
        localStorage.setItem("pinnedChatRooms", JSON.stringify(pinnedRooms));
      }

      toast.success("Chat room pinned successfully.");
    } catch {
      const errorMessage = "Failed to pin chat room";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const unpinChatRoom = useCallback(async (chatRoomId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // For now, work locally without backend API
      // TODO: Implement backend API endpoint for unpinning

      // Update local state
      setChatRooms((prev) =>
        prev.map((room) =>
          room.chatRoomId === chatRoomId ? { ...room, pinned: false } : room
        )
      );

      // Remove from localStorage
      const pinnedRooms = JSON.parse(
        localStorage.getItem("pinnedChatRooms") || "[]"
      );
      const updatedPinnedRooms = pinnedRooms.filter(
        (id: string) => id !== chatRoomId
      );
      localStorage.setItem(
        "pinnedChatRooms",
        JSON.stringify(updatedPinnedRooms)
      );

      toast.success("Chat room unpinned successfully.");
    } catch {
      const errorMessage = "Failed to unpin chat room";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);
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
          setUnreadCount((prev) => {
            const updated = { ...prev, [existingRoom.chatRoomId]: 0 };
            localStorage.setItem(
              UNREAD_COUNT_STORAGE_KEY,
              JSON.stringify(updated)
            );
            return updated;
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
  const refreshChatRoomsFromServer = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Clear localStorage first
      localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);

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
        setChatRooms(freshChatRooms);
        getUnreadMessagesCount(userId);
      } else {
        console.error(
          "❌ Failed to refresh chat rooms:",
          response.data.message
        );
        setError(response.data.message || "Failed to refresh chat rooms");
      }
    } catch (err: unknown) {
      console.error("❌ Error refreshing chat rooms:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Failed to refresh chat rooms."
        );
      } else {
        setError("An unexpected error occurred while refreshing chat rooms.");
      }
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  // fetch chat rooms from server on login/page load to avoid stale localStorage
  useEffect(() => {
    if (userId) {
      getChatRoomsRelatedToUser(userId);
    }
    // Optionally, clear chatRooms if user logs out
    if (!userId) {
      setChatRooms([]);
      localStorage.removeItem(CHAT_ROOMS_STORAGE_KEY);
    }
  }, [userId, getChatRoomsRelatedToUser]);
  // Auto-refresh chat rooms when SignalR connection is established
  // useEffect(() => {
  //   if (
  //     connection?.state === signalR.HubConnectionState.Connected &&
  //     user?.id
  //   ) {
  //     // Small delay to ensure connection is fully established
  //     const timer = setTimeout(() => {
  //       getChatRoomsRelatedToUser(user.id);
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [connection?.state, user?.id, getChatRoomsRelatedToUser]);

  // Periodic refresh every 30 seconds to ensure chatrooms stay up-to-date
  // useEffect(() => {
  //   if (
  //     !user?.id ||
  //     !connection ||
  //     connection.state !== signalR.HubConnectionState.Connected
  //   ) {
  //     return;
  //   }

  //   const interval = setInterval(() => {
  //     getChatRoomsRelatedToUser(user.id);
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  // }, [user?.id, connection, getChatRoomsRelatedToUser]);
  return (
    <ChatRoomContext.Provider
      value={{
        isDarkMode,
        markAsRead,
        unreadCount,
        setUnreadCount,
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
        getUnreadMessagesCount,
        setCurrentChatRoomId: setCurrentChatRoomIdWrapper,
        pinChatRoom,
        unpinChatRoom,
      }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
}
