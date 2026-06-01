"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import {
  convexUrlMisconfigurationHint,
  isValidConvexDeploymentUrl,
} from "@/lib/convex-url";

const AUTH_LINK_TIMEOUT_MS = 15_000;

function SessionHelpCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-dark mx-auto max-w-md space-y-4 p-6 text-center sm:p-8">
      <p className="font-semibold text-on-surface">{title}</p>
      {children}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <SignOutButton>
          <button
            type="button"
            className="min-h-11 rounded-full border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface"
          >
            Sign out
          </button>
        </SignOutButton>
        <Link
          href="/sign-in"
          className="min-h-11 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
        >
          Sign in
        </Link>
      </div>
      <p className="text-xs text-on-surface-dim">
        <a href="/api/env-check" className="underline" target="_blank" rel="noreferrer">
          Check server env config
        </a>
      </p>
    </div>
  );
}

export function ConvexAuthGate({ children }: { children: React.ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const configHint = convexUrlMisconfigurationHint(convexUrl);
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      return;
    }
    const t = window.setTimeout(() => setTimedOut(true), AUTH_LINK_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, [isLoading]);

  if (!isValidConvexDeploymentUrl(convexUrl)) {
    return (
      <SessionHelpCard title="Database URL misconfigured">
        <p className="text-sm text-on-surface-muted">
          {configHint ??
            "NEXT_PUBLIC_CONVEX_URL must be your Convex deployment (*.convex.cloud)."}
        </p>
        <p className="text-sm text-on-surface-muted">
          On Vercel, set it to{" "}
          <code className="text-primary">https://sensible-cow-847.convex.cloud</code>{" "}
          (not your Clerk domain), then redeploy.
        </p>
      </SessionHelpCard>
    );
  }

  if (isLoading && !timedOut) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-on-surface-muted">Connecting your session…</p>
        <p className="text-xs text-on-surface-dim">Linking Clerk sign-in to Convex</p>
      </div>
    );
  }

  if (isLoading && timedOut) {
    return (
      <SessionHelpCard title="Session link timed out">
        <p className="text-sm text-on-surface-muted">
          Clerk signed you in, but Convex did not confirm the session in time.
        </p>
        <ol className="list-inside list-decimal space-y-1 text-left text-sm text-on-surface-muted">
          <li>
            <a
              href="https://dashboard.clerk.com/apps/setup/convex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Clerk → Activate Convex integration
            </a>
          </li>
          <li>
            Convex dashboard → <code>CLERK_JWT_ISSUER_DOMAIN</code> = your Clerk
            Frontend API URL
          </li>
          <li>Sign out, then sign in again</li>
        </ol>
      </SessionHelpCard>
    );
  }

  if (!isAuthenticated) {
    return (
      <SessionHelpCard title="Database session not linked">
        <p className="text-sm text-on-surface-muted">
          You may be signed in to Clerk, but Convex did not receive a valid token.
          Activate the Clerk ↔ Convex integration and sign in again.
        </p>
        <ol className="list-inside list-decimal space-y-1 text-left text-sm text-on-surface-muted">
          <li>
            <a
              href="https://dashboard.clerk.com/apps/setup/convex"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Clerk → Activate Convex integration
            </a>
          </li>
          <li>Convex dashboard → <code>CLERK_JWT_ISSUER_DOMAIN</code> set</li>
          <li>Sign out below, then sign in again</li>
        </ol>
      </SessionHelpCard>
    );
  }

  return <>{children}</>;
}
