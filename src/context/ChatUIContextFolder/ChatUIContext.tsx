import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ChatUIContextType } from "../../Types/ContextTypes/contextType";

// eslint-disable-next-line react-refresh/only-export-components
export const ChatUIContext = createContext<ChatUIContextType | undefined>(
  undefined
);

export function ChatUIProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCanGoBack(location.pathname !== "/");
  }, [location]);

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  function goBack() {
    if (canGoBack) {
      console.log("Going back to previous screen");
      navigate(-1);
    } else {
      console.log("No history to go back to");
      navigate("/");
    }
  }

  return (
    <ChatUIContext.Provider
      value={{ isSidebarOpen, toggleSidebar, goBack, canGoBack }}
    >
      {children}
    </ChatUIContext.Provider>
  );
}
