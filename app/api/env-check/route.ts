import { NextResponse } from "next/server";

/** Public diagnostic — confirms Vercel runtime env (no secrets exposed) */
export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  const deployment = process.env.CONVEX_DEPLOYMENT ?? null;

  return NextResponse.json({
    ok: Boolean(convexUrl && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    convex: {
      configured: Boolean(convexUrl),
      urlHost: convexUrl
        ? new URL(convexUrl).hostname
        : null,
      deployment,
      note:
        "Vercel must use the same Convex URL where your data lives. Dev: sensible-cow-847.convex.cloud · Prod deploy: small-wolverine-190.convex.cloud",
    },
    clerk: {
      publishableKeySet: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
      secretKeySet: Boolean(process.env.CLERK_SECRET_KEY),
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "(not set)",
    },
    hint: !convexUrl
      ? "Add NEXT_PUBLIC_CONVEX_URL on Vercel and redeploy."
      : "If feed still fails: activate Clerk Convex integration, set CLERK_JWT_ISSUER_DOMAIN on Convex, sign out and in.",
  });
}
