"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Icon } from "./icon";

export function LandingAuthButtons() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link
        href="/feeds"
        className="min-h-11 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
      >
        Open app
      </Link>
    );
  }

  return (
    <>
      <SignInButton mode="modal">
        <button
          type="button"
          className="font-label rounded-full px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
        >
          Sign in
        </button>
      </SignInButton>
      <Link
        href="/sign-up"
        className="font-label rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90"
      >
        Join free
      </Link>
    </>
  );
}

export function LandingHeroCta() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link
        href="/feeds"
        className="font-label inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-wide text-on-primary uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
      >
        Go to feeds
        <Icon name="arrow_forward" />
      </Link>
    );
  }

  return (
    <Link
      href="/sign-up"
      className="font-label inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-wide text-on-primary uppercase shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
    >
      Create account
      <Icon name="arrow_forward" />
    </Link>
  );
}
