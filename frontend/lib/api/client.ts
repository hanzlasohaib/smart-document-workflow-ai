import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/auth/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set multipart boundaries for FormData uploads.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.set("Content-Type", false);
  } else if (!config.headers.get("Content-Type")) {
    config.headers.set("Content-Type", "application/json");
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
  if (!res.ok) {
    clearAccessToken();
    return null;
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    clearAccessToken();
    return null;
  }
  setAccessToken(data.access_token);
  return data.access_token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }
    if (original.url?.includes("/auth/login") || original.url?.includes("/auth/register")) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise = refreshPromise ?? refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
    const token = await refreshPromise;
    if (!token) {
      return Promise.reject(error);
    }
    original.headers.Authorization = `Bearer ${token}`;
    return api(original);
  },
);
