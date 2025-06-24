import { Routes, Route, Navigate } from "react-router-dom";
import ChatLayout from "./pages/ChatLayout";
import Providers from "./context/ContextWrapper/Providers";
import AuthPage from "./components/AuthPage";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./components/ProfilePage";

function App() {
  return (
    <Providers>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* Default route: AuthPage */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes */}
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <ChatLayout />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:chatRoomId"
          element={
            <PrivateRoute>
              <ChatLayout />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/chat" />} />
      </Routes>
    </Providers>
  );
}

export default App;
