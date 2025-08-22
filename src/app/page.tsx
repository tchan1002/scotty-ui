"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Scotty</h1>

      {status === "loading" && <p>Loading…</p>}

      {status === "authenticated" ? (
        <>
          <p>
            Signed in as{" "}
            {(session as Session).user?.name ||
              (session as Session).user?.email}
          </p>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded bg-black text-white"
              onClick={() => signOut()}
            >
              Sign out
            </button>
            <Link href="/dashboard" className="px-4 py-2 rounded border">
              Go to Dashboard
            </Link>
          </div>
        </>
      ) : (
        <button
          className="px-4 py-2 rounded bg-black text-white"
          onClick={() => signIn("github")}
        >
          Sign in with GitHub
        </button>
      )}
    </main>
  );
}
