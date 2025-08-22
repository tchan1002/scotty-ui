import { NextResponse } from "next/server";
import Redis from "ioredis";

// Reuse a single client across invocations
const redis = new Redis(process.env.REDIS_URL!);

export async function POST(req: Request) {
  try {
    const { full_name } = await req.json();
    if (!full_name || typeof full_name !== "string") {
      return NextResponse.json({ ok: false, error: "Missing repo" }, { status: 400 });
    }

    await redis.set("selected-repo", full_name);
    return NextResponse.json({ ok: true, selected: full_name });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  const repo = await redis.get("selected-repo");
  return NextResponse.json({ repo });
}
