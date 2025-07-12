import { Routes, Route, Navigate } from "react-router-dom";
import ChatLayout from "./pages/ChatLayout";
import AuthPage from "./components/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./components/ProfilePage";
import InnerProviders from "./components/InnerProviders";
import { useAuth } from "./context/AuthContextFolder/useAuth";

function App() {
  const { user, isAuthChecked } = useAuth();

  console.log("🚀 App render:", { user: user?.username, isAuthChecked });

  // Displaying a loading animation while checking auth
  if (!isAuthChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

export default App;
