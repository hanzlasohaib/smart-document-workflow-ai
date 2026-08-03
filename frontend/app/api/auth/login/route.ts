import { NextResponse } from "next/server";

import { apiBaseUrl, REFRESH_COOKIE, refreshCookieOptions } from "@/lib/bff/cookies";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json({ detail: "Email and password required" }, { status: 400 });
  }

  const form = new URLSearchParams();
  form.set("username", body.email);
  form.set("password", body.password);

  const upstream = await fetch(`${apiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const response = NextResponse.json({
    access_token: data.access_token,
    token_type: data.token_type ?? "bearer",
  });
  response.cookies.set(REFRESH_COOKIE, data.refresh_token, refreshCookieOptions());
  return response;
}
