"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignIn, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Shield, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { ADMIN_APP_TITLE } from "@/lib/admin/constants";
import { formatConvexError } from "@/lib/convex-errors";
import { clerkAuthAppearance } from "@/components/luo/auth-layout";

/**
 * Admin login — uses Clerk (email / Google / etc.).
 * After sign-in, bootstrap grants super_admin if your Clerk ID is in SUPER_ADMIN_CLERK_IDS.
 */
export default function AdminLoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const bootstrap = useMutation(api.admin.bootstrap);
  const hint = useQuery(api.admin.superAdminClerkHint);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "unauthorized"
      ? "You are signed in but not a super admin."
      : null,
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;
    (async () => {
      setBootstrapping(true);
      setError(null);
      try {
        await bootstrap({});
        if (!cancelled) {
          router.replace(params.get("redirect") ?? "/admin");
        }
      } catch (err) {
        if (!cancelled) setError(formatConvexError(err));
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, bootstrap, router, params]);

  return (
    <div className="flex min-h-screen-safe flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <Shield className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">{ADMIN_APP_TITLE}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Super admin access only · Patrick Anei
        </p>
      </div>

      {bootstrapping ? (
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="size-5 animate-spin" />
          Verifying admin access…
        </div>
      ) : (
        <SignIn
          routing="hash"
          forceRedirectUrl="/admin/login"
          appearance={clerkAuthAppearance}
        />
      )}

      {error && (
        <p className="mt-6 max-w-md text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {hint && (
        <p className="mt-4 max-w-sm text-center text-xs text-muted-foreground">
          {hint.hint} Configured IDs: {hint.configuredIds}
        </p>
      )}
    </div>
  );
}
