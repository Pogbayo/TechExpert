import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { Message } from "../../Types/EntityTypes/Message";
import type { MessageContextType } from "../../Types/ContextTypes/contextType";
import { useSignal } from "../SignalRContextFolder/useSignalR";
import axiosInstance from "../../IAxios/axiosInstance";

// eslint-disable-next-line react-refresh/only-export-components
export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messagesByChatRoomId, setmessagesByChatRoomId] = useState<Message[]>(
    []
  );
  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isMessageSent, setIsMessageSent] = useState<boolean>(false);
  const { connection } = useSignal();
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(
    null
  );
  const fetchMessagesByChatRoomId = useCallback(async (chatRoomId: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get<ApiResponse<Message[]>>(
        `/message/chatroom/${chatRoomId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        }
      );
      if (response.data.success && response.data.data) {
        setmessagesByChatRoomId(response.data.data ?? []);
      } else {
        setError(response.data.message || "Failed to load messages.");
        console.log("failed to load messages");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching messages."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }, []);
  const [lastMessage, setLastMessage] = useState<string>("");

  useEffect(() => {
    if (connection) {
      connection.on("ReceiveMessage", (newMessage: Message) => {
        setmessagesByChatRoomId((prev) => [...prev, newMessage]);
        setLastMessage(newMessage.content);
        console.log("New message received:", newMessage);
        console.log("Current chatRoomId:", newMessage.messageId);
      });

      connection.on("ReceiveMessage", (newMessage: Message) => {
        if (newMessage.chatRoomId === currentChatRoomId) {
          setmessagesByChatRoomId((prev) => [...prev, newMessage]);
        }
      });
    }

    return () => {
      if (connection) {
        connection.off("ReceiveMessage");
        // connection.off("DeleteMessage");
      }
    };
  }, [connection, currentChatRoomId]);

  function clearMessages() {
    setmessagesByChatRoomId([]);
  }

  async function sendMessage(
    chatRoomId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post<ApiResponse<Message>>(
        `/message/send-message`,
        {
          chatRoomId,
          senderId,
          content,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        }
      );
      if (response.data.success) {
        setIsMessageSent(true);
      } else {
        setError(response.data.message || "Failed to send message.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while sending message."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setIsMessageSent(false);
    }
  }

  async function deleteMessage(
    messageId: string
  ): Promise<ApiResponse<boolean>> {
    setLoading(true);
    setError("");
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `/api/messages/${messageId}`
      );
      if (response.data.success) {
        setmessagesByChatRoomId((prev) =>
          prev.filter((message) => message.messageId != messageId)
        );
        return {
          success: true,
          data: true,
          message: "Message deleted successfully.",
        };
      } else {
        setError(response.data.message || "Failed to delete message.");
        return {
          success: false,
          data: false,
          message: response.data.message || "Failed to delete message.",
        };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while deleting message."
        );
        return {
          success: false,
          data: false,
          message:
            err.response?.data?.message ||
            "An error occurred while deleting message.",
        };
      } else {
        setError("An unexpected error occurred.");
        return {
          success: false,
          data: false,
          message: "An unexpected error occurred.",
        };
      }
    } finally {
      setLoading(false);
    }
  }

  async function editMessage(messageId: string): Promise<ApiResponse<boolean>> {
    setLoading(true);
    setError("");
    try {
      const response = await axios.delete<ApiResponse<null>>(
        `/api/messages/${messageId}`
      );
      if (response.data.success) {
        setmessagesByChatRoomId((prev) =>
          prev.filter((message) => message.messageId != messageId)
        );
        return {
          success: true,
          data: true,
          message: "Message deleted successfully.",
        };
      } else {
        setError(response.data.message || "Failed to delete message.");
        return {
          success: false,
          data: false,
          message: response.data.message || "Failed to delete message.",
        };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while deleting message."
        );
        return {
          success: false,
          data: false,
          message:
            err.response?.data?.message ||
            "An error occurred while deleting message.",
        };
      } else {
        setError("An unexpected error occurred.");
        return {
          success: false,
          data: false,
          message: "An unexpected error occurred.",
        };
      }
    } finally {
      setLoading(false);
    }
  }
  return (
    <MessageContext.Provider
      value={{
        messagesByChatRoomId,
        fetchMessagesByChatRoomId,
        editMessage,
        isLoading,
        error,
        isMessageSent,
        clearMessages,
        sendMessage,
        deleteMessage,
        currentChatRoomId,
        lastMessage,
        setCurrentChatRoomId,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
