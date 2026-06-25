import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { env } from "@/lib/env";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/events/upcoming`, {
    headers: { Authorization: `Bearer ${session.session.token}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json(null, { status: res.status });
  return NextResponse.json(await res.json());
}
