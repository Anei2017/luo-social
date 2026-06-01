import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { clerkIdsFromEnv, isClerkSuperAdmin, requireSuperAdmin } from "./adminAuth";
import { getCurrentUser } from "./helpers";

type Ctx = QueryCtx | MutationCtx;

const DEFAULT_FEATURES = {
  marketplace: true,
  jobs: true,
  events: true,
  groups: true,
  reels: true,
  voiceRooms: false,
};

const DEFAULT_RULES =
  "Be respectful. Celebrate Luo culture. No hate speech, spam, or harassment.";

async function getGlobalSettings(ctx: Ctx) {
  const row = await ctx.db
    .query("appSettings")
    .withIndex("by_key", (q) => q.eq("key", "global"))
    .unique();
  if (row) return row;
  return {
    key: "global" as const,
    communityRules: DEFAULT_RULES,
    announcementBanner: undefined,
    features: DEFAULT_FEATURES,
    updatedAt: Date.now(),
  };
}

/** Promote Clerk ID from SUPER_ADMIN_CLERK_IDS to super_admin */
export const bootstrap = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in required");

    if (!isClerkSuperAdmin(identity.subject)) {
      throw new Error(
        "Your account is not configured as super admin. Set SUPER_ADMIN_CLERK_IDS in Convex.",
      );
    }

    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Create your LUO SOCIAL profile first (/onboarding)");

    await ctx.db.patch(user._id, {
      role: "super_admin",
      email: identity.email ?? user.email,
    });
    return { ok: true, userId: user._id };
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    const now = Date.now();
    const dayAgo = now - 86400000;

    const users = await ctx.db.query("users").collect();
    const posts = await ctx.db.query("posts").collect();
    const reports = await ctx.db.query("reports").collect();

    const newSignupsToday = users.filter((u) => u.createdAt >= dayAgo).length;
    const activeToday = users.filter(
      (u) => !u.banned && u.createdAt >= dayAgo,
    ).length;

    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      pendingReports: reports.filter((r) => r.status === "pending").length,
      newSignupsToday,
      activeToday,
      bannedUsers: users.filter((u) => u.banned).length,
    };
  },
});

export const analytics = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 14 }) => {
    await requireSuperAdmin(ctx);
    const now = Date.now();
    const start = now - days * 86400000;

    const users = await ctx.db.query("users").collect();
    const posts = await ctx.db.query("posts").collect();

    const userGrowth: { date: string; count: number }[] = [];
    const postsPerDay: { date: string; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const dayStart = new Date(now - i * 86400000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = dayStart.getTime() + 86400000;
      const label = dayStart.toISOString().slice(0, 10);

      userGrowth.push({
        date: label,
        count: users.filter(
          (u) => u.createdAt >= dayStart.getTime() && u.createdAt < dayEnd,
        ).length,
      });
      postsPerDay.push({
        date: label,
        count: posts.filter(
          (p) => p.createdAt >= dayStart.getTime() && p.createdAt < dayEnd,
        ).length,
      });
    }

    return { userGrowth, postsPerDay };
  },
});

export const listUsers = query({
  args: { search: v.optional(v.string()) },
  handler: async (ctx, { search }) => {
    await requireSuperAdmin(ctx);
    let users = await ctx.db.query("users").order("desc").collect();

    const q = search?.trim().toLowerCase();
    if (q) {
      users = users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.clan?.toLowerCase().includes(q),
      );
    }

    return users
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 200)
      .map((u) => ({
        _id: u._id,
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        avatarUrl: u.avatarUrl,
        clan: u.clan,
        role: u.role ?? "member",
        banned: u.banned ?? false,
        suspendedUntil: u.suspendedUntil,
        createdAt: u.createdAt,
      }));
  },
});

export const listPosts = query({
  args: { reportedOnly: v.optional(v.boolean()) },
  handler: async (ctx, { reportedOnly }) => {
    await requireSuperAdmin(ctx);
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(100);

    const reports = await ctx.db.query("reports").collect();
    const reportedPostIds = new Set(
      reports.filter((r) => r.postId).map((r) => r.postId as string),
    );

    const rows = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        if (reportedOnly && !reportedPostIds.has(post._id)) return null;
        return {
          ...post,
          author,
          reported: reportedPostIds.has(post._id),
        };
      }),
    );

    return rows.filter(Boolean);
  },
});

export const listReports = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("reviewed"))) },
  handler: async (ctx, { status }) => {
    await requireSuperAdmin(ctx);
    let rows = await ctx.db.query("reports").order("desc").collect();
    if (status) rows = rows.filter((r) => r.status === status);

    return Promise.all(
      rows.slice(0, 100).map(async (r) => {
        const reporter = await ctx.db.get(r.reporterId);
        const targetUser = r.targetUserId
          ? await ctx.db.get(r.targetUserId)
          : null;
        const post = r.postId ? await ctx.db.get(r.postId) : null;
        return { ...r, reporter, targetUser, post };
      }),
    );
  },
});

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    await requireSuperAdmin(ctx);
    return await getGlobalSettings(ctx);
  },
});

export const updateSettings = mutation({
  args: {
    communityRules: v.optional(v.string()),
    announcementBanner: v.optional(v.string()),
    features: v.optional(
      v.object({
        marketplace: v.boolean(),
        jobs: v.boolean(),
        events: v.boolean(),
        groups: v.boolean(),
        reels: v.boolean(),
        voiceRooms: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requireSuperAdmin(ctx);
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", "global"))
      .unique();

    const patch = {
      communityRules: args.communityRules ?? DEFAULT_RULES,
      announcementBanner: args.announcementBanner,
      features: args.features ?? DEFAULT_FEATURES,
      updatedAt: Date.now(),
      updatedBy: admin._id,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return await ctx.db.insert("appSettings", { key: "global", ...patch });
  },
});

export const setUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("member"),
      v.literal("moderator"),
      v.literal("super_admin"),
    ),
  },
  handler: async (ctx, { userId, role }) => {
    await requireSuperAdmin(ctx);
    await ctx.db.patch(userId, { role });
    return { ok: true };
  },
});

export const banUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
    banned: v.boolean(),
  },
  handler: async (ctx, { userId, reason, banned }) => {
    const admin = await requireSuperAdmin(ctx);
    if (userId === admin._id) throw new Error("Cannot ban yourself");

    await ctx.db.patch(userId, {
      banned,
      banReason: banned ? reason.trim() : undefined,
    });
    return { ok: true };
  },
});

export const suspendUser = mutation({
  args: {
    userId: v.id("users"),
    suspendedUntil: v.optional(v.number()),
  },
  handler: async (ctx, { userId, suspendedUntil }) => {
    const admin = await requireSuperAdmin(ctx);
    if (userId === admin._id) throw new Error("Cannot suspend yourself");
    await ctx.db.patch(userId, { suspendedUntil });
    return { ok: true };
  },
});

export const deleteUserAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const admin = await requireSuperAdmin(ctx);
    if (userId === admin._id) throw new Error("Cannot delete yourself");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .collect();
    for (const p of posts) await ctx.db.delete(p._id);

    await ctx.db.delete(userId);
    return { ok: true };
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts"), reason: v.optional(v.string()) },
  handler: async (ctx, { postId }) => {
    await requireSuperAdmin(ctx);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const c of comments) await ctx.db.delete(c._id);
    await ctx.db.delete(postId);
    return { ok: true };
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    await requireSuperAdmin(ctx);
    await ctx.db.delete(commentId);
    return { ok: true };
  },
});

export const reviewReport = mutation({
  args: {
    reportId: v.id("reports"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, { reportId, adminNote }) => {
    const admin = await requireSuperAdmin(ctx);
    await ctx.db.patch(reportId, {
      status: "reviewed",
      reviewedAt: Date.now(),
      reviewedBy: admin._id,
      adminNote,
    });
    return { ok: true };
  },
});

/** Public: feature flags for main app */
export const publicSettings = query({
  args: {},
  handler: async (ctx) => {
    const row = await getGlobalSettings(ctx);
    return {
      announcementBanner: row.announcementBanner,
      features: row.features,
    };
  },
});

export const superAdminClerkHint = query({
  args: {},
  handler: async () => {
    return {
      configuredIds: clerkIdsFromEnv().length,
      hint: "Set SUPER_ADMIN_CLERK_IDS in Convex dashboard (comma-separated Clerk user IDs).",
    };
  },
});
