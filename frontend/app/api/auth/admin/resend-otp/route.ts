import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/bff/cookies";

export async function POST(request: Request) {
  const body = (await request.json()) as { challenge_id?: string };
  if (!body.challenge_id) {
    return NextResponse.json({ detail: "challenge_id is required" }, { status: 400 });
  }

  const upstream = await fetch(`${apiBaseUrl()}/auth/admin/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challenge_id: body.challenge_id }),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
