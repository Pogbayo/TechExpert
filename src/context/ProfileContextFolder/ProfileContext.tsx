import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "../../IAxios/axiosInstance";
import { useAuth } from "../AuthContextFolder/useAuth";
import type { ProfileContextType } from "../../Types/ContextTypes/contextType";
import { useSignal } from "../SignalRContextFolder/useSignalR";

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { connection } = useSignal();

  const updateUsername = useCallback(
    async (newUsername: string) => {
      if (!user) return false;
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.put(
          "/applicationuser/update-username",
          {
            userId: user.id,
            newUsername,
          }
        );
        if (res.data && res.data.success) {
          setUser({ ...user, username: newUsername });
          setLoading(false);
          return true;
        } else {
          setError(res.data?.message || "Failed to update username");
          setLoading(false);
          return false;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to update username");
        setLoading(false);
        return false;
      }
    },
    [setUser, user]
  );

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    if (!user) return false;
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.put(
        "/api/applicationuser/update-password",
        {
          userId: user.id,
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
    connection.on("UsernameChanged", updateUsername);
    return () => {
      connection.off("UsernameChanged", updateUsername);
    };
  }, [connection, updateUsername]);

  return (
    <ProfileContext.Provider
      value={{ updateUsername, updatePassword, loading, error, setError }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
};
