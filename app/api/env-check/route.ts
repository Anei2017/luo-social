import { NextResponse } from "next/server";
import {
  convexUrlMisconfigurationHint,
  isValidConvexDeploymentUrl,
} from "@/lib/convex-url";

/** Public diagnostic — confirms Vercel runtime env (no secrets exposed) */
export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const convexValid = isValidConvexDeploymentUrl(convexUrl);
  const convexMisconfig = convexUrlMisconfigurationHint(convexUrl);

  const deployment = process.env.CONVEX_DEPLOYMENT ?? null;

  return NextResponse.json({
    ok: Boolean(
      convexValid && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    ),
    convex: {
      configured: Boolean(convexUrl),
      valid: convexValid,
      urlHost: convexUrl
        ? new URL(convexUrl).hostname
        : null,
      expectedExample: "sensible-cow-847.convex.cloud",
      misconfiguration: convexMisconfig,
      deployment,
      note:
        "NEXT_PUBLIC_CONVEX_URL must be *.convex.cloud — NOT the Clerk issuer (golden-albacore-21.clerk.accounts.dev). CLERK_JWT_ISSUER_DOMAIN belongs only in Convex dashboard env.",
    },
    clerk: {
      publishableKeySet: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      secretKeySet: Boolean(process.env.CLERK_SECRET_KEY),
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "(not set)",
    },
    hint: convexMisconfig
      ? convexMisconfig
      : !convexUrl
        ? "Add NEXT_PUBLIC_CONVEX_URL on Vercel and redeploy."
        : "If feed still fails: activate Clerk Convex integration, set CLERK_JWT_ISSUER_DOMAIN on Convex, sign out and in.",
  });
}
