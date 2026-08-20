export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isNetworkError(error: unknown): boolean {
  if (isBrowserOffline()) return true;
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: string; message?: string; response?: unknown };
  if (err.response) return false;
  return (
    err.code === "ERR_NETWORK" ||
    err.code === "ECONNABORTED" ||
    err.code === "ERR_CANCELED" ||
    err.message === "Network Error"
  );
}

export function isTimeoutError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const err = error as { code?: string; message?: string };
  return err.code === "ECONNABORTED" || /timeout/i.test(err.message ?? "");
}

export function httpStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const status = (error as { response?: { status?: number } }).response?.status;
  return typeof status === "number" ? status : undefined;
}
