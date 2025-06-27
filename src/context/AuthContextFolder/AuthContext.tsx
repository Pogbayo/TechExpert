import { createContext, useEffect, useState, type ReactNode } from "react";
import { AxiosError } from "axios";
import type {
  AuthContextType,
  LoginResponse,
} from "../../Types/ContextTypes/contextType";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { ApplicationUser } from "../../Types/EntityTypes/ApplicationUser";
import axiosInstance from "../../IAxios/axiosInstance";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [fetchedUser, setfetchedUser] = useState<ApplicationUser | null>(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${storedToken}`;
    }
    setIsAuthChecked(true);
  }, []);

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

        console.log(token, loggedInUser);

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
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      console.log(axiosError);
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
