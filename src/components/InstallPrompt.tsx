import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hideOnAuth, setHideOnAuth] = useState(false);

  useEffect(() => {
    // Hide install prompt if user navigates to /chat or /profile
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path.startsWith("/chat") || path.startsWith("/profile")) {
        setHideOnAuth(true);
      } else {
        setHideOnAuth(false);
      }
    };
    window.addEventListener("popstate", handleRouteChange);
    handleRouteChange();
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  // handler to dismiss the prompt and persist the choice
  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed or dismissed before
      const alreadyInstalled = localStorage.getItem("pwa-installed");
      const dismissed = localStorage.getItem("pwa-dismissed");
      if (!alreadyInstalled && !dismissed) {
        setIsVisible(true);
      }
    };
    const handleAppInstalled = () => {
      localStorage.setItem("pwa-installed", "true");
      setIsVisible(false);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", 
        handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      // User accepted
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  // Determine if we are on the auth page
  // const path = window.location.pathname;
  // const isAuthPage = path === '/auth' || path === '/';

  if (!isVisible || hideOnAuth) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      <div className="relative bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-2xl flex flex-col md:flex-row items-center justify-between p-6 gap-4 border-2 border-blue-300 max-w-lg w-full mx-4">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white text-2xl font-bold hover:text-blue-200 focus:outline-none"
          aria-label="Dismiss install prompt"
        >
          ×
        </button>
        <div className="flex-1 text-center md:text-left">
          <div className="font-bold text-lg mb-1">
            Install Spag Chat for the Best Experience!
          </div>
          <div className="text-sm opacity-90">
            Enjoy a beautiful, app-like UI, faster access, and offline support
            when you install Spag Chat on your device.
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="mt-3 md:mt-0 px-6 py-2 bg-white text-blue-700 font-bold rounded-lg shadow hover:bg-blue-100 transition border border-blue-500"
        >
          Install Now
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
