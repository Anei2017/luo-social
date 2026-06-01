"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EnsureProfile({ children }: { children: React.ReactNode }) {
  const user = useQuery(api.users.current);
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/onboarding");
    }
  }, [user, router]);

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <div className="card-dark mx-auto max-w-md p-8 text-center text-sm text-on-surface-muted">
        <p>
          Set <code className="text-primary">NEXT_PUBLIC_CONVEX_URL</code> in{" "}
          <code className="text-primary">.env.local</code> and run{" "}
          <code className="text-primary">npx convex dev</code>.
        </p>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-on-surface-muted">Loading your profile…</p>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  return <>{children}</>;
}
