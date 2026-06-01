"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuthLayout } from "@/components/luo/auth-layout";
import { formatConvexError } from "@/lib/convex-errors";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const existingProfile = useQuery(api.users.current);
  const upsert = useMutation(api.users.upsertFromClerk);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existingProfile) {
      router.replace("/feed");
    }
  }, [existingProfile, router]);

  useEffect(() => {
    if (!isLoaded || !user || initialized) return;
    const suggested =
      user.username ??
      user.primaryEmailAddress?.emailAddress?.split("@")[0] ??
      "member";
    setUsername(suggested.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24));
    setDisplayName(user.fullName ?? suggested);
    setInitialized(true);
  }, [isLoaded, user, initialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await upsert({
        username: clean,
        displayName: displayName.trim() || clean,
        avatarUrl: user?.imageUrl,
        bio: bio.trim() || undefined,
      });
      router.replace("/feed");
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout tagline="One last step — set up your creator profile.">
      <div className="w-full max-w-md rounded-2xl border border-outline bg-surface/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <h1 className="text-center text-2xl font-bold text-on-surface">
          Welcome to LUO SOCIAL
        </h1>
        <p className="mt-2 text-center text-sm text-on-surface-muted">
          Choose how the community will know you.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-on-surface-muted">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-on-surface-muted">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-on-surface-muted">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Tell the community about your craft…"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-on-primary disabled:opacity-50"
          >
            {loading ? "Saving…" : "Enter LUO SOCIAL"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
