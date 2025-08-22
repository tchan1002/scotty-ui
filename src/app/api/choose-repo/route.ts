import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { full_name } = await req.json();
    if (!full_name) {
      return NextResponse.json({ ok: false, error: "Missing repo" }, { status: 400 });
    }

    // Save globally for now — later you could scope by user/session
    await kv.set("selected-repo", full_name);

    return NextResponse.json({ ok: true, selected: full_name });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
    const repo = await kv.get<string>("selected-repo");
    return NextResponse.json({ repo });
  }
  