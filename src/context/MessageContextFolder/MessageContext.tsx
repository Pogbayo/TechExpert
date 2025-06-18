import { createContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { Message } from "../../Types/EntityTypes/Message";
import type { MessageContextType } from "../../Types/ContextTypes/contextType";
import { useSignal } from "../SignalRContextFolder/useSignalR";

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

  async function fetchMessagesByChatRoomId(chatRoomId: string): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get<ApiResponse<Message[]>>(
        `/api/messages/${chatRoomId}`
      );
      if (response.data.success) {
        setmessagesByChatRoomId(response.data.data ?? []);
      } else {
        setError(response.data.message || "Failed to load messages.");
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
  }

  useEffect(() => {
    if (connection) {
      connection.on("ReceiveMessage", (newMessage: Message) => {
        setmessagesByChatRoomId((prev) => [...prev, newMessage]);
      });

      // connection.on("DeleteMessage", (deletedMessageId: string) => {
      //   setMessages((prev) =>
      //     prev.filter((message) => message.MessageId !== deletedMessageId)
      //   );
      // });
    }

    return () => {
      if (connection) {
        connection.off("ReceiveMessage");
        connection.off("DeleteMessage");
      }
    };
  }, [connection]);

  function clearMessages() {
    setmessagesByChatRoomId([]);
  }

  async function sendMessage(
    chatRoomId: string,
    content: string,
    isGroup: boolean
  ): Promise<ApiResponse<boolean>> {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post<ApiResponse<boolean>>(
        `/api/message/send-message`,
        {
          chatRoomId,
          content,
          isGroup,
        }
      );
      if (response.data.success) {
        setIsMessageSent(true);
        return {
          success: true,
          data: true,
          message: "Message sent successfully.",
          error: "",
        };
      } else {
        setError(response.data.message || "Failed to send message.");
        return {
          success: false,
          data: false,
          message: response.data.message || "Failed to send message.",
        };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while sending message."
        );
        return {
          success: false,
          data: false,
          message:
            err.response?.data?.message ||
            "An error occurred while sending message.",
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
          prev.filter((message) => message.MessageId != messageId)
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
        isLoading,
        error,
        isMessageSent,
        clearMessages,
        sendMessage,
        deleteMessage,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
