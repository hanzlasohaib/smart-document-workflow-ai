import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/bff/cookies";

export async function POST(request: Request) {
  const body = await request.json();
  const upstream = await fetch(`${apiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
