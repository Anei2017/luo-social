"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode, useMemo } from "react";

function ConvexMissingBanner() {
  return (
    <div className="border-b border-primary/40 bg-primary/10 px-4 py-3 text-center text-sm text-on-surface">
      <strong>Database not connected.</strong> Add{" "}
      <code className="text-primary">NEXT_PUBLIC_CONVEX_URL</code> to{" "}
      <code className="text-primary">.env.local</code>, then run{" "}
      <code className="text-primary">npx convex dev</code>.
    </div>
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  const client = useMemo(() => {
    if (!url) return null;
    return new ConvexReactClient(url);
  }, [url]);

  if (!client) {
    return (
      <>
        <ConvexMissingBanner />
        {children}
      </>
    );
  }

  return (
    <ConvexProviderWithClerk client={client} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
