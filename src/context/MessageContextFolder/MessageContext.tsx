import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  useRef,
} from "react";
import axios from "axios";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { Message } from "../../Types/EntityTypes/Message";
import type { MessageContextType } from "../../Types/ContextTypes/contextType";
import { useSignal } from "../SignalRContextFolder/useSignalR";
import axiosInstance from "../../IAxios/axiosInstance";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// eslint-disable-next-line react-refresh/only-export-components
export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
);

export function MessageProvider({ children }: { children: ReactNode }) {
  const [messagesByChatRoomId, setmessagesByChatRoomId] = useState<{
    [chatRoomId: string]: Message[] | null;
  }>(() => {
    const cached = localStorage.getItem("messagesCacheByRoom");
    return cached ? JSON.parse(cached) : {};
  });

  useEffect(() => {
    localStorage.setItem(
      "messagesCacheByRoom",
      JSON.stringify(messagesByChatRoomId)
    );
  }, [messagesByChatRoomId]);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isMessageSent, setIsMessageSent] = useState<boolean>(false);
  const { connection } = useSignal();
  const [currentChatRoomId, setCurrentChatRoomId] = useState<string | null>(
    null
  );
  const currentChatRoomIdRef = useRef<string | null>(null);
  const navigate = useNavigate();

  const updateCurrentChatRoomId = (id: string | null) => {
    setCurrentChatRoomId(id);
    currentChatRoomIdRef.current = id;
  };

  function updateMessages(chatRoomId: string, messages: Message[]) {
    setmessagesByChatRoomId((prev) => {
      const updated = {
        ...prev,
        [chatRoomId]: messages,
      };
      localStorage.setItem("messagesCacheByRoom", JSON.stringify(updated));
      return updated;
    });
  }

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
        updateMessages(chatRoomId, response.data.data);
        // console.log(response.data.data && messagesByChatRoomId[chatRoomId]);
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
  }, []);

  // async function sendMessage(
  //   chatRoomId: string,
  //   senderId: string,
  //   content: string
  // ): Promise<void> {
  //   setLoading(true);
  //   setError("");
  //   const tempMessageId = Date.now().toString();
  //   const clientMessageId = `${senderId}-${Date.now()}`;
  //   const minimalUser = { id: senderId, username: "Sending...", dpUrl: null, email: undefined };
  //   const newMessage = {
  //     messageId: tempMessageId,
  //     clientMessageId,
  //     chatRoomId,
  //     sender: minimalUser,
  //     content,
  //     timestamp: new Date().toISOString(),
  //   };
  //   setmessagesByChatRoomId((prev) => {
  //     const existing = prev[chatRoomId] || [];
  //     return { ...prev, [chatRoomId]: [...existing, newMessage] };
  //   });
  
  //   try {
  //     const requestPayload = {
  //       ChatRoomId: chatRoomId,
  //       SenderId: senderId,
  //       Content: content,
  //     };

  //     const response = await axiosInstance.post<ApiResponse<Message>>(
  //       `/message/send-message`,
  //       requestPayload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.data.success && response.data.data) {
  //       setmessagesByChatRoomId((prev) => {
  //         const roomId = chatRoomId;
  //         const existingMessages = prev[roomId] || [];
  //         // Avoid duplicates if SignalR also adds it
  //         const alreadyExists = existingMessages.some(
  //           (msg) => msg.messageId === response.data.data!.messageId
  //         );
  //         if (alreadyExists) return prev;
  //         return {
  //           ...prev,
  //           [roomId]: [...existingMessages, response.data.data!],
  //         };
  //       });
  //       console.log(
  //         "Message was sent and this is the payload",
  //         response.data.data
  //       );
  //       setIsMessageSent(true);
  //     } else {
  //       setError(response.data.message || "Failed to send message.");
  //       toast.error("Failed to send message..");
  //     }
  //   } catch (err: unknown) {
  //     if (axios.isAxiosError(err)) {
  //       const errorMessage =
  //         err.response?.data?.message ||
  //         err.response?.data?.error ||
  //         err.message ||
  //         "An error occurred while sending message.";

  //       setError(errorMessage);
  //       toast.error(errorMessage);
  //     } else {
  //       const errorMessage = "An unexpected error occurred.";
  //       setError(errorMessage);
  //       toast.error(errorMessage);
  //     }
  //   } finally {
  //     setLoading(false);
  //     setIsMessageSent(false);
  //   }
  // }

  async function sendMessage(
    chatRoomId: string,
    senderId: string,
    content: string
  ): Promise<void> {
    setLoading(true);
    setError("");

    try {
      const requestPayload = {
        ChatRoomId: chatRoomId,
        SenderId: senderId,
        Content: content,
      };

      const response = await axiosInstance.post<ApiResponse<Message>>(
        `/message/send-message`,
        requestPayload,
        {
          headers: {  Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          "Content-Type": "application/json",
        },
      }
    );
console.log("")
    if (response.data.success && response.data.data) {
      setmessagesByChatRoomId((prev) => {
        const roomId = chatRoomId;
        const existingMessages = prev[roomId] || [];
        // Avoid duplicates if SignalR also adds it
        const alreadyExists = existingMessages.some(
          (msg) => msg.messageId === response.data.data!.messageId
        );
        if (alreadyExists) return prev;
        return {
          ...prev,
          [roomId]: [...existingMessages, response.data.data!],
        };
      });
      setIsMessageSent(true);
    } else {
      setError(response.data.message || "Failed to send message.");
      toast.error("Failed to send message..");
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "An error occurred while sending message.";

      setError(errorMessage);
      toast.error(errorMessage);
    } else {
      const errorMessage = "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } } finally {
      setLoading(false);
      setIsMessageSent(false);
    }
  }
  useEffect(() => {
    if (connection) {
      connection.on("ReceiveMessage", (newMessage: Message) => {
        console.log("Received message:", newMessage);
        setmessagesByChatRoomId((prev) => {
          const roomId = newMessage.chatRoomId;
          const existingMessages = prev[roomId] || [];
          const alreadyExists = existingMessages.some(
            (msg) => msg.messageId === newMessage.messageId
          );

          if (alreadyExists) {
            return prev;
          }

          const updatedMessages = [...existingMessages, newMessage];
          return {
            ...prev,
            [roomId]: updatedMessages,
          };
        });
      });
    }

    return () => {
      if (connection) {
        connection.off("ReceiveMessage");
      }
    };
  }, [connection]);

  async function deleteMessage(
    messageId: string
  ): Promise<ApiResponse<boolean>> {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.delete<ApiResponse<null>>(
        `/messages/${messageId}`
      );

      if (response.data.success) {
        setmessagesByChatRoomId((prev) => {
          const roomId = currentChatRoomIdRef.current;
          if (!roomId || !prev[roomId]) return prev;

          const updatedMessages = prev[roomId].filter(
            (message) => message.messageId !== messageId
          );

          const updated = {
            ...prev,
            [roomId]: updatedMessages,
          };

          localStorage.setItem("messagesCacheByRoom", JSON.stringify(updated));
          return updated;
        });

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
      const response = await axiosInstance.put<ApiResponse<null>>(
        `/messages/edit/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
          },
        }
      );

      if (response.data.success) {
        fetchMessagesByChatRoomId(currentChatRoomIdRef.current ?? "");
        return {
          success: true,
          data: true,
          message: "Message edited successfully.",
        };
      } else {
        setError(response.data.message || "Failed to edit message.");
        return {
          success: false,
          data: false,
          message: response.data.message || "Failed to edit message.",
        };
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while editing message."
        );
        return {
          success: false,
          data: false,
          message:
            err.response?.data?.message ||
            "An error occurred while editing message.",
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

  function openChatRoom(chatRoomId: string) {
    setCurrentChatRoomId(chatRoomId);
    currentChatRoomIdRef.current = chatRoomId;

    navigate(`/chat:${chatRoomId}`);
    fetchMessagesByChatRoomId(chatRoomId);
    // if (connection) {
    //   connection.invoke("JoinRoom", chatRoomId).catch((err) => {
    //     console.error("Failed to join chat room:", err);
    //   });
    // }
  }

  function clearMessages() {
    const roomId = currentChatRoomIdRef.current;
    if (!roomId) return;

    setmessagesByChatRoomId((prev) => {
      const updated = {
        ...prev,
        [roomId]: [],
      };
      localStorage.setItem("messagesCacheByRoom", JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <MessageContext.Provider
      value={{
        messagesByChatRoomId,
        setmessagesByChatRoomId,
        fetchMessagesByChatRoomId,
        editMessage,
        isLoading,
        error,
        isMessageSent,
        clearMessages,
        sendMessage,
        deleteMessage,
        openChatRoom,
        currentChatRoomId,
        setCurrentChatRoomId: updateCurrentChatRoomId,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
