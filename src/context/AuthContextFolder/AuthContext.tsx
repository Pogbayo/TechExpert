import { createContext, useEffect, useState, type ReactNode } from "react";
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import type {
  AuthContextType,
  LoginResponse,
} from "../../Types/ContextTypes/contextType";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { ApplicationUser } from "../../Types/EntityTypes/ApplicationUser";
import axiosInstance from "../../IAxios/axiosInstance";
import { useSignal } from "../SignalRContextFolder/useSignalR";
// import toast from "react-hot-toast";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [fetchedUser, setfetchedUser] = useState<ApplicationUser | null>(null);
  const { connection } = useSignal();

  // Function to check if token is valid
  const isTokenValid = (token: string): boolean => {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      const isValid = decoded.exp * 1000 > Date.now();
      return isValid;
    } catch {
      return false;
    }
  };

  // Function to validate stored token and user
  const validateStoredAuth = async () => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken && isTokenValid(storedToken)) {
      try {
        // Set the token in axios headers
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;

        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch {
        logout();
      }
    } else if (storedToken && !isTokenValid(storedToken)) {
      logout();
    }

    setIsAuthChecked(true);
  };

  useEffect(() => {
    validateStoredAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!connection || !user) return;
    const handler = (userId: string, newUsername: string) => {
      if (userId === user.id) {
        setUser((prev) => {
          if (!prev) return prev;
          const updatedUser = { ...prev, username: newUsername };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    };
    connection.on("UsernameChanged", handler);
    return () => {
      connection.off("UsernameChanged", handler);
    };
  }, [connection, user]);

  async function login(
    Email: string,
    Password: string
  ): Promise<ApiResponse<LoginResponse>> {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
        "/applicationuser/login",
        { Email, Password }
      );

      if (response.data.success && response.data.data) {
        const token = response.data.data.token;
        const loggedInUser = response.data.data.user;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        setUser(loggedInUser);
      }

      return {
        success: true,
        message: "Login successful",
        data: response.data.data,
        error: "",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        message: "Login failed",
        data: undefined,
        error:
          axiosError.response?.data?.message ||
          "An error occurred during login",
      };
    } finally {
      setIsLoading(false);
    }
  }

  async function register(
    Username: string,
    Email: string,
    Password: string
  ): Promise<ApiResponse<string>> {
    try {
      const response = await axiosInstance.post<ApiResponse<string>>(
        "/applicationuser/register",
        { Username, Email, Password }
      );
      return {
        success: true,
        message: "Registration successful",
        data: response.data.data,
        error: "",
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        message: "Registration failed",
        data: "",
        error:
          axiosError.response?.data?.message ||
          "An error occurred during registration",
      };
    }
  }

  async function getUserById(userId: string): Promise<void> {
    try {
      const response = await axiosInstance.get<ApiResponse<ApplicationUser>>(
        `/applicationuser/by-id/${userId}`
      );
      if (response.data.success && response.data.data) {
        setfetchedUser(response.data.data);
      }
    } catch {
      console.log("Failed to fetch user");
    }
  }

  function logout() {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chatRoom");
    localStorage.removeItem("chatRooms");
    localStorage.removeItem("messagesCacheByRoom");
    localStorage.removeItem("chatRoomUsers");

    // Clear axios authorization header
    delete axiosInstance.defaults.headers.common["Authorization"];
    
    // Navigate to auth page instead of clearing user state
    window.location.href = '/auth';
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        register,
        getUserById,
        isLoading,
        isAuthChecked,
        fetchedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
