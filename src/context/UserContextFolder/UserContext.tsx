import { createContext, useState, type ReactNode } from "react";
import axios from "axios";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { UserContextType } from "../../Types/ContextTypes/contextType";
import type { ApplicationUser } from "../../Types/EntityTypes/ApplicationUser";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<ApplicationUser[]>([]);
  const [error, setError] = useState<string>("");

  async function fetchUsers(numberOfUsers: number): Promise<void> {
    setIsLoading(true);
    try {
      const response = axios.get<ApiResponse<ApplicationUser[]>>(
        `/api/applicationuser/all-users/${numberOfUsers}`
      );
      const data = (await response).data;
      if (data.success) {
        setUsers(data.data ?? []);
      } else {
        setError(data.message || "Failed to fetch users.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching users."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function getUserById(userId: string): Promise<void> {
    setIsLoading(true);
    try {
      const response = axios.get<ApiResponse<ApplicationUser>>(
        `/api/applicationuser/by-id/${userId}`
      );
      const data = (await response).data;
      if (data.success) {
        setUser(data.data ?? null);
      } else {
        setError(data.message || "Failed to fetch user.");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "An error occurred while fetching user."
        );
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <UserContext.Provider
      value={{
        fetchUsers,
        users,
        isLoading,
        error,
        user,
        getUserById,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
