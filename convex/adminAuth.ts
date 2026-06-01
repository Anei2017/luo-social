import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getCurrentUser } from "./helpers";

type Ctx = QueryCtx | MutationCtx;

/** Clerk user IDs allowed to become super_admin (set in Convex dashboard: SUPER_ADMIN_CLERK_IDS) */
export function clerkIdsFromEnv(): string[] {
  const raw = process.env.SUPER_ADMIN_CLERK_IDS ?? "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isClerkSuperAdmin(clerkId: string): boolean {
  return clerkIdsFromEnv().includes(clerkId);
}

export async function requireSuperAdmin(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("No profile — sign up on the app first");

  const isAdmin =
    user.role === "super_admin" || isClerkSuperAdmin(identity.subject);
  if (!isAdmin) throw new Error("Super admin access only");

  return user;
}
