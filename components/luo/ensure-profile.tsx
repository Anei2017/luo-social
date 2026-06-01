"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EnsureProfile({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useQuery(api.users.current);

  useEffect(() => {
    if (user === null) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  if (user === undefined) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-on-surface-muted">Loading your profile…</p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-on-surface-muted">Setting up your profile…</p>
        <Link href="/onboarding" className="text-sm font-medium text-primary underline">
          Continue to onboarding
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
