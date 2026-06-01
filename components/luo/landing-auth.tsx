"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { Icon } from "./icon";

export function LandingAuthButtons() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link
        href="/feed"
        className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary"
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
        href="/feed"
        className="font-label inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-wide text-on-primary uppercase shadow-lg transition-transform hover:scale-[1.02]"
      >
        Go to feed
        <Icon name="arrow_forward" />
      </Link>
    );
  }

  return (
    <Link
      href="/sign-up"
      className="font-label inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold tracking-wide text-on-primary uppercase shadow-lg transition-transform hover:scale-[1.02]"
    >
      Create account
      <Icon name="arrow_forward" />
    </Link>
  );
}
