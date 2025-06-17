import { createContext, useState, type ReactNode } from "react";

import axios, { AxiosError } from "axios";
import type { AuthContextType } from "../../Types/ContextTypes/contextType";
import type { ApiResponse } from "../../Types/ApiResponseTypes/ApiResponse";
import type { ApplicationUser } from "../../Types/EntityTypes/ApplicationUser";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApplicationUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function login(
    username: string,
    password: string
  ): Promise<ApiResponse<string>> {
    try {
      setIsLoading(true);
      const response = await axios.post<ApiResponse<string>>("/api/login", {
        username,
        password,
      });
      setIsLoading(false);
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
        data: "",
        error:
          axiosError.response?.data?.message ||
          "An error occurred during login",
      };
    }
  }

  async function register(
    username: string,
    password: string
  ): Promise<ApiResponse<number>> {
    try {
      const response = await axios.post<ApiResponse<number>>("/api/register", {
        username,
        password,
      });
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
        data: undefined,
        error:
          axiosError.response?.data?.message ||
          "An error occurred during registration",
      };
    }
  }

  async function getUserById(
    userId: string
  ): Promise<ApiResponse<ApplicationUser>> {
    try {
      const response = await axios.get<ApiResponse<ApplicationUser>>(
        `/api/users/${userId}`
      );
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
      }
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      return {
        success: false,
        message: "User fetch failed",
        data: {
          id: "",
          Username: "",
          DpUrl: "",
        } as ApplicationUser,
        error:
          axiosError.response?.data?.message ||
          "An error occurred while fetching user",
      };
    }
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, getUserById, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
