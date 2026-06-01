import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const isBlocked = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = await getCurrentUser(ctx);
    if (!me || me._id === userId) return false;

    const blocks = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", me._id))
      .collect();

    return blocks.some((b) => b.blockedId === userId);
  },
});

export const block = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    if (me._id === userId) throw new Error("Cannot block yourself");

    const existing = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", me._id))
      .collect();

    if (existing.some((b) => b.blockedId === userId)) return { ok: true };

    await ctx.db.insert("blocks", {
      blockerId: me._id,
      blockedId: userId,
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});

export const unblock = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const rows = await ctx.db
      .query("blocks")
      .withIndex("by_blocker", (q) => q.eq("blockerId", me._id))
      .collect();

    for (const row of rows) {
      if (row.blockedId === userId) await ctx.db.delete(row._id);
    }
    return { ok: true };
  },
});

export const report = mutation({
  args: {
    reason: v.string(),
    targetUserId: v.optional(v.id("users")),
    postId: v.optional(v.id("posts")),
  },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const reason = args.reason.trim();
    if (reason.length < 3) throw new Error("Please describe the issue.");

    await ctx.db.insert("reports", {
      reporterId: me._id,
      targetUserId: args.targetUserId,
      postId: args.postId,
      reason,
      status: "pending",
      createdAt: Date.now(),
    });
    return { ok: true };
  },
});
