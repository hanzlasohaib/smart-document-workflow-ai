import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { httpStatus, isBrowserOffline, isNetworkError, isTimeoutError } from "@/lib/network";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Safe internal return path only (ADR-05-003). */
export function safeReturnUrl(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (isBrowserOffline() || (isNetworkError(error) && !httpStatus(error))) {
    if (isTimeoutError(error)) {
      return "The request timed out. Check your connection and try again.";
    }
    return "You're offline or the server is unreachable. Reconnect and try again.";
  }

  const status = httpStatus(error);
  if (status === 401) return "Your session expired. Log in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "This item was not found.";
  if (status === 429) return "Too many requests. Wait a moment and try again.";
  if (status && status >= 500) return "The server had a problem. Try again in a moment.";

  if (typeof error === "object" && error !== null && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: unknown } } }).response
      ?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => (typeof d === "object" && d && "msg" in d ? String(d.msg) : String(d)))
        .join(", ");
    }
  }
  if (error instanceof Error && error.message && error.message !== "Network Error") {
    return error.message;
  }
  return fallback;
}
