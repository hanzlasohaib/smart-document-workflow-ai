"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { User } from "@/lib/api/types";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/token";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (!res.ok) {
      clearAccessToken();
      return false;
    }
    const data = (await res.json()) as { access_token?: string };
    if (!data.access_token) {
      clearAccessToken();
      return false;
    }
    setAccessToken(data.access_token);
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getAccessToken()) {
        await refreshSession();
      }
      if (!cancelled) setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  const meQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: fetchMe,
    enabled: bootstrapped && !!getAccessToken(),
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.detail === "string" ? data.detail : "Invalid credentials",
        );
      }
      setAccessToken(data.access_token);
      const user = await fetchMe();
      queryClient.setQueryData(queryKeys.auth.me, user);
      return user;
    },
    [queryClient],
  );

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof data.detail === "string" ? data.detail : "Registration failed",
      );
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getAccessToken();
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    clearAccessToken();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: meQuery.data ?? null,
      loading: !bootstrapped || (!!getAccessToken() && meQuery.isLoading),
      login,
      register,
      logout,
      refreshSession,
    }),
    [meQuery.data, bootstrapped, meQuery.isLoading, login, register, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth(options?: { role?: "user" | "admin" }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
      return;
    }
    if (options?.role === "admin" && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, router, pathname, options?.role]);

  return { user, loading };
}
