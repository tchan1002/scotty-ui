import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionWithExtra } from "@/lib/auth";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

// keep only [a-z0-9-], lowercase, collapse repeats
function sanitizeLogin(login: string) {
  return login
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as SessionWithExtra | null;
  if (!session?.userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!session.accessToken) {
    return NextResponse.json({ ok: false, error: "Missing GitHub token" }, { status: 401 });
  }

  // Fetch the GitHub username (login) using the user’s access token
  const gh = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });

  if (!gh.ok) {
    const text = await gh.text();
    return NextResponse.json({ ok: false, error: `GitHub ${gh.status}: ${text}` }, { status: 502 });
  }

  const me: { login?: string } = await gh.json();
  const raw = me.login || session.user?.email || `u${session.userId}`;
  const login = sanitizeLogin(raw);
  const inbound = `${login}@inbox.scotty.ink`;

  // Store reverse mapping for webhook: inbound:<login> -> userId
  await redis.set(`inbound:${login}`, session.userId);

  return NextResponse.json({
    ok: true,
    userId: session.userId,
    login,
    inbound,
  });
}
