import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import ChatLayout from "./pages/ChatLayout";
import Providers from "./context/ContextWrapper/Providers";
import AuthPage from "./components/AuthPage";

function App() {
  return (
    <Router>
      <Providers>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" />} />
          <Route path="/chat" element={<ChatLayout />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/chat/:chatRoomId" element={<ChatLayout />} />
          <Route path="*" element={<Navigate to="/chat" />} />
        </Routes>
      </Providers>
    </Router>
  );
}

export default App;
