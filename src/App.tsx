import { Routes, Route, Navigate } from "react-router-dom";
import ChatLayout from "./pages/ChatLayout";
import AuthPage from "./components/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./components/ProfilePage";
import InnerProviders from "./components/InnerProviders";
import { useAuth } from "./context/AuthContextFolder/useAuth";

export default function App() {
  const { user, isAuthChecked } = useAuth();
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <div className="text-xl font-bold animate-pulse">Checking authentication...</div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Public routes - no providers needed */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes - wrapped with providers */}
        <Route
          path="/chat"
          element={
            <InnerProviders userId={user?.id || ""}>
              <PrivateRoute>
                <ChatLayout />
              </PrivateRoute>
            </InnerProviders>
          }
        />
        <Route
          path="/profile"
          element={
            <InnerProviders userId={user?.id || ""}>
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            </InnerProviders>
          }
        />
        {/* Fallback - redirect based on auth status */}
        <Route path="*" element={<Navigate to={user ? "/chat" : "/auth"} />} />
      </Routes>
    </>
  );
}
