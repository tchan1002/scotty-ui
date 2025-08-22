import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, type SessionWithExtra } from "@/lib/auth";

// deterministic address: u<githubId>@inbox.scotty.ink
function addressFor(userId: string) {
  return `u${userId}@inbox.scotty.ink`;
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as SessionWithExtra | null;
  if (!session?.userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    userId: session.userId,
    inbound: addressFor(session.userId),
  });
}
