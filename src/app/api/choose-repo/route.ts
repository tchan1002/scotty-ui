import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionWithExtra } from "@/lib/auth";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

function keyFor(userId: string) {
  return `selected-repo:${userId}`;
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions)) as SessionWithExtra | null;
  if (!session?.userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { full_name } = await req.json();
  if (!full_name || typeof full_name !== "string") {
    return NextResponse.json({ ok: false, error: "Missing repo" }, { status: 400 });
  }

  await redis.set(keyFor(session.userId), full_name);
  return NextResponse.json({ ok: true, selected: full_name });
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as SessionWithExtra | null;

  if (!session?.userId) {
    // 👇 ensures valid JSON even if not signed in
    return NextResponse.json({ repo: null, error: "Unauthorized" }, { status: 401 });
  }

  const repo = await redis.get(keyFor(session.userId));
  return NextResponse.json({ repo });
}
