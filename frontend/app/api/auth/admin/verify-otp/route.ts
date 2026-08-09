import { NextResponse } from "next/server";

import { apiBaseUrl, REFRESH_COOKIE, refreshCookieOptions } from "@/lib/bff/cookies";

export async function POST(request: Request) {
  const body = (await request.json()) as { challenge_id?: string; code?: string };
  if (!body.challenge_id || !body.code) {
    return NextResponse.json(
      { detail: "challenge_id and code are required" },
      { status: 400 },
    );
  }

  const upstream = await fetch(`${apiBaseUrl()}/auth/admin/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      challenge_id: body.challenge_id,
      code: body.code,
    }),
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
