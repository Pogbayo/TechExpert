import { AuthProvider } from "../context/AuthContextFolder/AuthContext";
import Providers from "../context/ContextWrapper/Providers";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Providers>{children}</Providers>
    </AuthProvider>
  );
}
