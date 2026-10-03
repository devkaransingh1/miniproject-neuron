import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "@/components/auth/auth-context";
import {
  getAuthSnapshot,
  logout,
  refreshAuth,
  subscribeToAuth,
} from "@/components/auth/auth-store";

export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const auth = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getAuthSnapshot,
  );

  useEffect(() => {
    const controller = new AbortController();
    refreshAuth(controller.signal, pathname);
    return () => controller.abort();
  }, [pathname]);

  const value = {
    ...auth,
    status: auth.path === pathname ? auth.status : "checking",
    refreshAuth: () => refreshAuth(undefined, pathname),
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
