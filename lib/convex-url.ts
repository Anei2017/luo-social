/** True when value looks like a Convex deployment URL (not Clerk issuer, etc.) */
export function isValidConvexDeploymentUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const host = new URL(url.trim()).hostname;
    return host.endsWith(".convex.cloud");
  } catch {
    return false;
  }
}

export function convexUrlMisconfigurationHint(url: string | undefined): string | null {
  if (!url?.trim()) {
    return "Set NEXT_PUBLIC_CONVEX_URL to your Convex deployment (e.g. https://sensible-cow-847.convex.cloud).";
  }
  if (isValidConvexDeploymentUrl(url)) return null;
  try {
    const host = new URL(url.trim()).hostname;
    if (host.includes("clerk")) {
      return `NEXT_PUBLIC_CONVEX_URL is set to a Clerk domain (${host}). Use your *.convex.cloud URL from the Convex dashboard — not CLERK_JWT_ISSUER_DOMAIN.`;
    }
  } catch {
    /* fall through */
  }
  return "NEXT_PUBLIC_CONVEX_URL must be a valid https://….convex.cloud deployment URL.";
}
