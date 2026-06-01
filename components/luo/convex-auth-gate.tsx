"use client";

import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export function ConvexAuthGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthLoading>
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-on-surface-muted">Connecting your session…</p>
          <p className="text-xs text-on-surface-dim">Linking Clerk sign-in to Convex</p>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="card-dark mx-auto max-w-md space-y-4 p-6 text-center sm:p-8">
          <p className="font-semibold text-on-surface">Database session not linked</p>
          <p className="text-sm text-on-surface-muted">
            You may be signed in to Clerk, but Convex did not receive a valid token.
            This is usually fixed by activating the Clerk ↔ Convex integration and
            signing in again.
          </p>
          <ol className="text-left text-sm text-on-surface-muted list-decimal list-inside space-y-1">
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
      </Unauthenticated>

      <Authenticated>{children}</Authenticated>
    </>
  );
}
