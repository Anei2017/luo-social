import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, pushNotification } from "./helpers";

export const toggle = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, { followingId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    if (me._id === followingId) throw new Error("Cannot follow yourself");

    const target = await ctx.db.get(followingId);
    if (!target) throw new Error("User not found");

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", me._id).eq("followingId", followingId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    }

    await ctx.db.insert("follows", {
      followerId: me._id,
      followingId,
      createdAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: followingId,
      actorId: me._id,
      type: "follow",
      message: "started following you",
    });

    return { following: true };
  },
});

export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const me = await getCurrentUser(ctx);
    if (!me || me._id === userId) return false;

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) =>
        q.eq("followerId", me._id).eq("followingId", userId),
      )
      .unique();

    return !!existing;
  },
});

export const stats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const followers = (
      await ctx.db
        .query("follows")
        .withIndex("by_following", (q) => q.eq("followingId", userId))
        .collect()
    ).length;
    const following = (
      await ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", userId))
        .collect()
    ).length;
    return { followers, following };
  },
});

export const listFollowing = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 12 }) => {
    const rows = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .order("desc")
      .take(limit);

    return (
      await Promise.all(
        rows.map(async (r) => ctx.db.get(r.followingId)),
      )
    ).filter(Boolean);
  },
});
