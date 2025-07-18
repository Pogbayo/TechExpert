import { Routes, Route, Navigate } from "react-router-dom";
import ChatLayout from "./pages/ChatLayout";
import AuthPage from "./components/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./components/ProfilePage";
import InnerProviders from "./components/InnerProviders";
import { useAuth } from "./context/AuthContextFolder/useAuth";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  const { user, isAuthChecked } = useAuth();

  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <div className="text-xl font-bold animate-pulse">
          Checking authentication...
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Toaster position="top-center" reverseOrder={false} />

      {/* 🔽 The install prompt component */}
      <InstallPrompt />

      {/* 🔽 My routes */}
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />

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
        <Route path="*" element={<Navigate to={user ? "/chat" : "/auth"} />} />
      </Routes>
    </div>
  );
}
