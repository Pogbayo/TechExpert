import { useContext } from "react";
import { UserContext } from "./UserContext";

export function useUser() {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useMessage must be used within a UserProvider");
  }

  return context;
}
