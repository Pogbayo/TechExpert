import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContextFolder/useAuth";
import type { JSX } from "react";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, isAuthChecked } = useAuth();

  if (!isAuthChecked) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return children;
}
