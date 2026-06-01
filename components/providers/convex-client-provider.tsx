"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ReactNode, useMemo } from "react";
import {
  convexUrlMisconfigurationHint,
  isValidConvexDeploymentUrl,
} from "@/lib/convex-url";

function ConvexConfigBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-primary/40 bg-primary/10 px-4 py-3 text-center text-sm text-on-surface">
      <strong>Database misconfigured.</strong> {message}{" "}
      <a href="/api/env-check" className="text-primary underline" target="_blank" rel="noreferrer">
        Check config
      </a>
      {" · "}
      Fix in Vercel → Environment Variables, then <strong>Redeploy</strong>.
    </div>
  );
}

export function ConvexClientProvider({
  children,
  convexUrl,
}: {
  children: ReactNode;
  /** Passed from server so Vercel runtime env is always used */
  convexUrl?: string;
}) {
  const url = convexUrl ?? process.env.NEXT_PUBLIC_CONVEX_URL;
  const configHint = convexUrlMisconfigurationHint(url);

  const client = useMemo(() => {
    if (!isValidConvexDeploymentUrl(url)) return null;
    return new ConvexReactClient(url!);
  }, [url]);

  if (!client) {
    return (
      <>
        <ConvexConfigBanner
          message={
            configHint ??
            "Set NEXT_PUBLIC_CONVEX_URL in Vercel to your *.convex.cloud deployment URL."
          }
        />
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
