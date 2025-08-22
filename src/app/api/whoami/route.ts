import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionWithExtra } from "@/lib/auth";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

function keyFor(userId: string) {
  return `selected-repo:${userId}`;
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as SessionWithExtra | null;
  if (!session?.userId) {
    return NextResponse.json({ authed: false }, { status: 401 });
  }
  const repo = await redis.get(keyFor(session.userId));
  return NextResponse.json({
    authed: true,
    userId: session.userId,             // <- your GitHub numeric id
    userEmail: session.user?.email ?? null,
    key: keyFor(session.userId),        // <- the exact Redis key we use
    repo,
  });
}
