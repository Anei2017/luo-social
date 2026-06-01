"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AuthLayout } from "@/components/luo/auth-layout";
import { formatConvexError } from "@/lib/convex-errors";
import { withTimeout } from "@/lib/with-timeout";

const SAVE_TIMEOUT_MS = 20_000;

export default function OnboardingPage() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { isLoading: convexLoading, isAuthenticated } = useConvexAuth();
  const existingProfile = useQuery(api.users.current);
  const upsert = useMutation(api.users.upsertFromClerk);
  const submittedRef = useRef(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  useEffect(() => {
    if (existingProfile) {
      window.location.assign("/feed");
    }
  }, [existingProfile]);

  useEffect(() => {
    if (!clerkLoaded || !user || initialized) return;
    const suggested =
      user.username ??
      user.primaryEmailAddress?.emailAddress?.split("@")[0] ??
      "member";
    setUsername(suggested.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 24));
    setDisplayName(user.fullName ?? suggested);
    setInitialized(true);
  }, [clerkLoaded, user, initialized]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || submittedRef.current) return;

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (clean.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (!convexUrl) {
      setError("Database URL missing on this deployment. Contact support or redeploy Vercel with NEXT_PUBLIC_CONVEX_URL.");
      return;
    }

    if (!isAuthenticated) {
      setError(
        "Database is not connected to your sign-in. Activate Clerk ↔ Convex integration, then sign out and sign in again.",
      );
      return;
    }

    setLoading(true);
    setError(null);
    submittedRef.current = true;

    try {
      await withTimeout(
        upsert({
          username: clean,
          displayName: displayName.trim() || clean,
          avatarUrl: user?.imageUrl ?? undefined,
          bio: bio.trim() || undefined,
        }),
        SAVE_TIMEOUT_MS,
        "Save timed out. Check your internet, then try again. If this keeps happening, sign out and sign in again after linking Clerk to Convex.",
      );
      window.location.assign("/feed");
    } catch (err) {
      submittedRef.current = false;
      setError(formatConvexError(err));
      setLoading(false);
    }
  }

  function cancelSave() {
    submittedRef.current = false;
    setLoading(false);
    setError(null);
  }

  let body: React.ReactNode;

  if (!convexUrl) {
    body = (
      <StatusCard
        title="Database not configured"
        message="NEXT_PUBLIC_CONVEX_URL is missing. Add it in Vercel and redeploy."
      />
    );
  } else if (!clerkLoaded || convexLoading || existingProfile === undefined) {
    body = (
      <StatusCard
        title="Welcome to LUO SOCIAL"
        message="Checking your account…"
        spinner
      />
    );
  } else if (!isAuthenticated) {
    body = (
      <StatusCard
        title="Connect your account"
        message="You're signed in with Clerk, but the database session is not linked yet."
      >
        <ol className="mt-4 list-decimal list-inside space-y-1 text-left text-sm text-on-surface-muted">
          <li>
            <a
              href="https://dashboard.clerk.com/apps/setup/convex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Activate Convex in Clerk
            </a>
          </li>
          <li>
            Set <code className="text-primary">CLERK_JWT_ISSUER_DOMAIN</code> in
            Convex dashboard
          </li>
          <li>Sign out, then sign in again</li>
        </ol>
        <div className="mt-6 flex flex-col gap-2">
          <SignOutButton>
            <button
              type="button"
              className="w-full rounded-full border border-outline py-3 text-sm font-semibold text-on-surface"
            >
              Sign out
            </button>
          </SignOutButton>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded-full bg-primary py-3 text-sm font-bold text-on-primary"
          >
            Retry
          </button>
        </div>
      </StatusCard>
    );
  } else {
    body = (
      <div className="w-full max-w-md rounded-2xl border border-outline bg-surface/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <h1 className="text-center text-2xl font-bold text-on-surface">
          Welcome to LUO SOCIAL
        </h1>
        <p className="mt-2 text-center text-sm text-on-surface-muted">
          Choose how the community will know you.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-medium text-on-surface-muted">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
              className="mt-1 w-full rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-on-surface-muted">
              Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={loading}
              autoComplete="name"
              className="mt-1 w-full rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-on-surface-muted">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading}
              rows={3}
              className="mt-1 w-full rounded-xl border border-outline bg-surface-elevated px-4 py-3 text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              placeholder="Tell the community about your craft…"
            />
          </div>
          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !isAuthenticated}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-bold text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving…" : "Enter LUO SOCIAL"}
          </button>
          {loading && (
            <button
              type="button"
              onClick={cancelSave}
              className="w-full text-center text-sm text-on-surface-muted underline"
            >
              Cancel — stuck? Tap here
            </button>
          )}
        </form>
      </div>
    );
  }

  return <AuthLayout tagline="One last step — set up your creator profile.">{body}</AuthLayout>;
}

function StatusCard({
  title,
  message,
  spinner,
  children,
}: {
  title: string;
  message: string;
  spinner?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-outline bg-surface/95 p-6 text-center shadow-2xl backdrop-blur-md sm:p-8">
      <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
      <p className="mt-2 text-sm text-on-surface-muted">{message}</p>
      {spinner && (
        <div
          className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </div>
  );
}
