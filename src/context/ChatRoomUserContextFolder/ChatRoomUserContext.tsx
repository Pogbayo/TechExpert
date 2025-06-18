import { createContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { ChatRoomUserContextType } from "../../Types/ContextTypes/contextType";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { ApplicationUser } from "../../Types/EntityTypes/ApplicationUser";
import { useSignal } from "../SignalRContextFolder/useSignalR";

// eslint-disable-next-line react-refresh/only-export-components
export const ChatRoomUserContext = createContext<
  ChatRoomUserContextType | undefined
>(undefined);

export function ChatRoomUserProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatRoomUsers, setChatRoomUsers] = useState<ApplicationUser[]>([]);
  const { connection } = useSignal();
  const CHAT_ROOM_USERS_STORAGE_KEY = "chatRoomUsers";

  useEffect(() => {
    const storedUsers = localStorage.getItem(CHAT_ROOM_USERS_STORAGE_KEY);
    if (storedUsers) {
      try {
        const parsedUsers: ApplicationUser[] = JSON.parse(storedUsers);
        setChatRoomUsers(parsedUsers);
      } catch {
        localStorage.removeItem(CHAT_ROOM_USERS_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (chatRoomUsers.length > 0) {
      localStorage.setItem(
        CHAT_ROOM_USERS_STORAGE_KEY,
        JSON.stringify(chatRoomUsers)
      );
    } else {
      localStorage.removeItem(CHAT_ROOM_USERS_STORAGE_KEY);
    }
  }, [chatRoomUsers]);

  async function addUserToChatRoom(
    chatRoomId: string,
    userIds: string[]
  ): Promise<ApiResponse<boolean>> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse<ApplicationUser[]>>(
        `/api/chatrooms/${chatRoomId}/add-users`,
        { userIds }
      );

      if (response.data.success && response.data.data) {
        setChatRoomUsers((prev) => [...prev, ...(response.data.data ?? [])]);
        setIsLoading(false);
        return { success: true };
      } else {
        setError(response.data.message || "Failed to add users.");
        setIsLoading(false);
        return { success: false, message: response.data.message };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || "Failed to add users.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }
      setError("An unexpected error occurred.");
      setIsLoading(false);
      return { success: false, message: "An unexpected error occurred." };
    }
  }

  async function removeUserFromChatRoom(
    chatRoomId: string,
    userId: string
  ): Promise<ApiResponse<boolean>> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `/api/chatrooms/${chatRoomId}/remove-user/${userId}`
      );

      if (response.data.success) {
        setChatRoomUsers((prev) => prev.filter((user) => user.id !== userId));
        setIsLoading(false);
        return { success: true };
      } else {
        setError(response.data.message || "Failed to remove user.");
        setIsLoading(false);
        return { success: false, message: response.data.message };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || "Failed to remove user.";
        setError(msg);
        setIsLoading(false);
        return { success: false, message: msg };
      }
      setError("An unexpected error occurred.");
      setIsLoading(false);
      return { success: false, message: "An unexpected error occurred." };
    }
  }

  async function getUsersFromChatRoom(chatRoomId: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse<ApplicationUser[]>>(
        `/api/chatrooms/${chatRoomId}/users`
      );
      if (response.data.success) {
        setChatRoomUsers(response.data.data ?? []);
      } else {
        setError(response.data.message || "Failed to get users.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to get users.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (connection) {
      connection.on("UserAddedToChatRoom", (newUser: ApplicationUser) => {
        setChatRoomUsers((prev) => [...prev, newUser]);
      });

      connection.on("UserRemovedFromChatRoom", (removedUserId: string) => {
        setChatRoomUsers((prev) =>
          prev.filter((user) => user.id !== removedUserId)
        );
      });
    }

    return () => {
      if (connection) {
        connection.off("UserAddedToChatRoom");
        connection.off("UserRemovedFromChatRoom");
      }
    };
  }, [connection]);

  return (
    <ChatRoomUserContext.Provider
      value={{
        addUserToChatRoom,
        removeUserFromChatRoom,
        getUsersFromChatRoom,
        isLoading,
        error,
        chatRoomUsers,
      }}
    >
      {children}
    </ChatRoomUserContext.Provider>
  );
}
