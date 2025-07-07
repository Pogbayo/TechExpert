import { AuthProvider } from "../context/AuthContextFolder/AuthContext";
import InnerProviders from "./InnerProviders";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <InnerProviders>{children}</InnerProviders>
    </AuthProvider>
  );
}
