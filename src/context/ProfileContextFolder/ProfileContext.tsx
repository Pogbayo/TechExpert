import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "../../IAxios/axiosInstance";
import type { ProfileContextType } from "../../Types/ContextTypes/contextType";
import { useSignal } from "../SignalRContextFolder/useSignalR";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState<string>("");
  const { connection } = useSignal();

  const updateUsername = useCallback(
    async (newUsername: string): Promise<ApiResponse<string>> => {
      if (!userId)
        return { success: false, message: "User ID is missing", data: "" };
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.put(
          "/applicationuser/update-username",
          {
            userId,
            newUsername,
          }
        );
        if (res.data && res.data.success) {
          // setUser({ ...user, username: res.data.data });
          setUsername(res.data.data);
          setLoading(false);
          return {
            success: true,
            message: res.data.message || "Username updated successfully",
            data: res.data.data,
          };
        } else {
          setError(res.data?.message || "Failed to update username");
          setLoading(false);
          return {
            success: false,
            message: res.data?.message || "Failed to update username",
            data: "",
          };
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to update username");
        setLoading(false);
        return {
          success: false,
          message: e?.response?.data?.message || "Failed to update username",
          data: "",
        };
      }
    },
    [userId]
  );

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!userId) return false;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.put(
        "/api/applicationuser/update-password",
        {
          userId,
          currentPassword,
          newPassword,
        }
      );
      if (res.data && res.data.success) {
        setLoading(false);
        return true;
      } else {
        setError(res.data?.message || "Failed to update password");
        setLoading(false);
        return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to update password");
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (!connection) {
      return;
    }
    const handleUsernameChanged = (newUsername: string) => {
      setUsername(newUsername);
    };
    connection.on("UsernameChanged", handleUsernameChanged);
    return () => {
      connection.off("UsernameChanged", handleUsernameChanged);
    };
  }, [connection]);

  return (
    <ProfileContext.Provider
      value={{
        updateUsername,
        updatePassword,
        loading,
        error,
        setError,
        username,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
};
