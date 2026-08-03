import { NextResponse } from "next/server";

import {
  apiBaseUrl,
  getRefreshCookie,
  REFRESH_COOKIE,
  refreshCookieOptions,
} from "@/lib/bff/cookies";

export async function POST(request: Request) {
  const refresh = await getRefreshCookie();
  const auth = request.headers.get("authorization");

  if (refresh && auth) {
    await fetch(`${apiBaseUrl()}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
      body: JSON.stringify({ refresh_token: refresh }),
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set(REFRESH_COOKIE, "", { ...refreshCookieOptions(), maxAge: 0 });
  return response;
}
