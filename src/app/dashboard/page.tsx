"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";

type Repo = {
  id: number;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [error, setError] = useState<string>("");
  const [selected, setSelected] = useState<string>("");
  const [busy, setBusy] = useState<string>(""); // full_name while posting

  useEffect(() => {
    if (status !== "authenticated") return;
    const s = session as Session & { accessToken?: string };
    const token = s?.accessToken;
    if (!token) {
      setError("No GitHub access token. Sign out and back in.");
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          "https://api.github.com/user/repos?per_page=100&sort=updated",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
        if (!res.ok) throw new Error(`GitHub ${res.status}`);
        const data: Repo[] = await res.json();
        setRepos(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
      }
    })();
  }, [status, session]);

  async function chooseRepo(full_name: string) {
    try {
      setBusy(full_name);
      setError("");
      const res = await fetch("/api/choose-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name }),
      });
      const data: { ok: boolean; selected?: string; error?: string } = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setSelected(data.selected || full_name);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setBusy("");
    }
  }

  if (status === "loading") return <main className="p-8">Loading…</main>;
  if (status !== "authenticated") return <main className="p-8">Please sign in on the home page.</main>;

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-4">Your GitHub Repos</h1>
      {selected && (
        <div className="mb-4 rounded bg-green-50 border border-green-200 p-3">
          ✅ Selected: <strong>{selected}</strong>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded bg-red-50 border border-red-200 p-3">
          ⚠️ {error}
        </div>
      )}

      <ul className="space-y-3">
        {repos.map((r) => (
          <li key={r.id} className="border rounded p-3 flex items-start justify-between gap-3">
            <div>
              <a
                href={r.html_url}
                target="_blank"
                rel="noreferrer"
                className="font-medium underline"
              >
                {r.full_name}
              </a>
              <div className="text-sm opacity-70">
                {r.private ? "Private" : "Public"}
                {r.description ? ` — ${r.description}` : ""}
              </div>
            </div>
            <button
              disabled={busy === r.full_name}
              onClick={() => chooseRepo(r.full_name)}
              className="shrink-0 px-3 py-2 rounded bg-black text-white disabled:opacity-50"
              aria-busy={busy === r.full_name}
            >
              {busy === r.full_name ? "Saving…" : "Select"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
