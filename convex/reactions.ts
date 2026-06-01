import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, pushNotification } from "./helpers";

const reactionType = v.union(
  v.literal("like"),
  v.literal("love"),
  v.literal("laugh"),
  v.literal("sad"),
  v.literal("wow"),
);

export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const rows = await ctx.db
      .query("postReactions")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    return await Promise.all(
      rows.map(async (r) => ({
        ...r,
        user: await ctx.db.get(r.userId),
      })),
    );
  },
});

export const set = mutation({
  args: { postId: v.id("posts"), reaction: reactionType },
  handler: async (ctx, { postId, reaction }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("postReactions")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", postId),
      )
      .unique();

    if (existing?.reaction === reaction) {
      await ctx.db.delete(existing._id);
      return { reaction: null };
    }

    if (existing) await ctx.db.delete(existing._id);

    await ctx.db.insert("postReactions", {
      postId,
      userId: user._id,
      reaction,
      createdAt: Date.now(),
    });

    const labels: Record<string, string> = {
      like: "liked",
      love: "loved",
      laugh: "laughed at",
      sad: "reacted to",
      wow: "wowed",
    };
    await pushNotification(ctx, {
      userId: post.authorId,
      actorId: user._id,
      type: "like",
      postId,
      message: `${labels[reaction]} your post`,
    });

    return { reaction };
  },
});

/** Backward-compatible toggle (defaults to like) */
export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("postReactions")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", postId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("postReactions", {
      postId,
      userId: user._id,
      reaction: "like",
      createdAt: Date.now(),
    });

    const post = await ctx.db.get(postId);
    if (post) {
      await pushNotification(ctx, {
        userId: post.authorId,
        actorId: user._id,
        type: "like",
        postId,
        message: "liked your post",
      });
    }

    return { liked: true };
  },
});
