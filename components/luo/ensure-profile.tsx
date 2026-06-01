"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const LOAD_TIMEOUT_MS = 15_000;

export function EnsureProfile({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return (
      <div className="card-dark mx-auto max-w-md p-6 text-center text-sm text-on-surface-muted sm:p-8">
        <p className="font-semibold text-on-surface">Database not connected</p>
        <p className="mt-2">
          Add <code className="text-primary">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
          <strong>Vercel → Settings → Environment Variables</strong>, then{" "}
          <strong>Redeploy</strong>.
        </p>
      </div>
    );
  }

  return <EnsureProfileInner>{children}</EnsureProfileInner>;
}

function EnsureProfileInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.current);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (user === null) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  useEffect(() => {
    if (user !== undefined && !convexAuthLoading) {
      setTimedOut(false);
      return;
    }
    const t = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [user, convexAuthLoading]);

  if (convexAuthLoading || (isAuthenticated && user === undefined)) {
    if (timedOut) {
      return (
        <div className="card-dark mx-auto max-w-md space-y-3 p-6 text-center text-sm sm:p-8">
          <p className="font-semibold text-on-surface">Still loading…</p>
          <p className="text-on-surface-muted">
            This usually means Convex is not linked to Clerk on production.
          </p>
          <ol className="text-left text-on-surface-muted list-decimal list-inside space-y-1">
            <li>
              Vercel: set <code className="text-primary">NEXT_PUBLIC_CONVEX_URL</code>{" "}
              and redeploy
            </li>
            <li>
              Convex dashboard: set <code className="text-primary">CLERK_JWT_ISSUER_DOMAIN</code>
            </li>
            <li>Run <code className="text-primary">npx convex deploy</code></li>
          </ol>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-on-surface-muted">Loading your profile…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="card-dark mx-auto max-w-md p-6 text-center sm:p-8">
        <p className="text-on-surface-muted">Sign in to use LUO SOCIAL.</p>
        <Link
          href="/sign-in"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  return <>{children}</>;
}
