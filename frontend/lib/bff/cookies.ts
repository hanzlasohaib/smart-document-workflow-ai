import { cookies } from "next/headers";

export const REFRESH_COOKIE = "sdw_refresh";

export function refreshCookieOptions() {
  const secure = process.env.COOKIE_SECURE === "true";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export function apiBaseUrl(): string {
  return (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000/api/v1"
  );
}

export async function getRefreshCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value;
}
