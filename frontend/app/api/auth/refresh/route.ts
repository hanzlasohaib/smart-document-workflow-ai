import { NextResponse } from "next/server";

import {
  apiBaseUrl,
  getRefreshCookie,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/bff/cookies";

export async function POST() {
  const refresh = await getRefreshCookie();
  if (!refresh) {
    return NextResponse.json({ detail: "No refresh session" }, { status: 401 });
  }

  const upstream = await fetch(`${apiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    const response = NextResponse.json(data, { status: upstream.status });
    response.cookies.set(REFRESH_COOKIE, "", { ...refreshCookieOptions(), maxAge: 0 });
    return response;
  }

  const response = NextResponse.json({
    access_token: data.access_token,
    token_type: data.token_type ?? "bearer",
  });
  response.cookies.set(REFRESH_COOKIE, data.refresh_token, refreshCookieOptions());
  return response;
}
