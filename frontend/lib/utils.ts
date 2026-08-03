import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  if (error instanceof Error) return error.message;
  return fallback;
}
