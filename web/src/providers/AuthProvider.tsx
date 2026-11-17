"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api, { AUTH_KEYS, setUnauthorizedHandler } from "@/lib/api";
import { useDemoMode } from "@/hooks/useDemoMode";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      setToken(null);
    });

    const savedToken = localStorage.getItem(AUTH_KEYS.TOKEN);
    const savedUser = localStorage.getItem(AUTH_KEYS.USER);

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(AUTH_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
      if (data.refreshToken) {
        localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (registerData: RegisterData) => {
    try {
      const { data } = await api.post("/auth/register", registerData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem(AUTH_KEYS.TOKEN, data.token);
      if (data.refreshToken) {
        localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refreshToken);
      }
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_KEYS.USER);
    api.post("/auth/logout").catch(() => {});
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedUser };
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(newUser));
      return newUser;
    });
  }, []);

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
