"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authApi, endWebSession, getCurrentWebSession } from "@/lib/api";
import { useWebSessionActivity } from "@/hooks/useWebSessionActivity";
import {
  startWebSession,
  subscribeToWebSession,
  updateWebSession,
  WebSession,
  WebSessionResponse,
} from "@/lib/web-session";
import { useDemoMode } from "@/hooks/useDemoMode";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  /** True for both LGU_ADMIN and FIELD_WORKER — general admin dashboard access */
  isAdmin: boolean;
  /** True ONLY for LGU_ADMIN — required for zone create/update/delete */
  isLguAdmin: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useDemoMode();
  const queryClient = useQueryClient();
  const activeSessionId = useRef<string>();
  const [session, setSession] = useState<WebSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = session?.user ?? null;
  const token = session?.token ?? null;

  useWebSessionActivity(session?.sessionId, session?.idleUntil);

  useEffect(() => {
    function syncSession(next: WebSession | null) {
      if (activeSessionId.current && activeSessionId.current !== next?.sessionId) {
        queryClient.clear();
      }
      activeSessionId.current = next?.sessionId;
      setSession(next);
    }

    const unsubscribe = subscribeToWebSession(syncSession);
    // Web credentials from before server-side idle enforcement need a new sign-in.
    for (const key of ["bluewaste_user", "bluewaste_token", "bluewaste_refresh_token"]) {
      localStorage.removeItem(key);
    }
    syncSession(getCurrentWebSession());
    setIsLoading(false);
    return unsubscribe;
  }, [queryClient]);

  const startSession = useCallback(async (path: string, credentials: Record<string, string>) => {
    const { data } = await authApi.post<WebSessionResponse>(path, credentials);
    startWebSession(data);
  }, []);

  const login = useCallback((email: string, password: string) =>
    startSession("/auth/web/login", { email, password }), [startSession]);

  const register = useCallback(async (registerData: RegisterData) => {
    await authApi.post("/auth/register", registerData);
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string) => {
    await startSession("/auth/web/verify-email", { email, code });
  }, [startSession]);

  const resendVerification = useCallback(async (email: string) => {
    await authApi.post("/auth/resend-verification", { email });
  }, []);

  const logout = useCallback(() => {
    const current = getCurrentWebSession();
    if (current) endWebSession(current);
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    const current = getCurrentWebSession();
    if (current?.sessionId !== session?.sessionId || !current) return;
    updateWebSession(current.sessionId, { user: { ...current.user, ...updatedUser } });
  }, [session?.sessionId]);

  const isAdmin = user?.role === "LGU_ADMIN" || user?.role === "FIELD_WORKER";
  const isLguAdmin = user?.role === "LGU_ADMIN";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        logout,
        updateUser,
        isAdmin,
        isLguAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
