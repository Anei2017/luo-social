import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { enrichReel, getCurrentUser, pushNotification } from "./helpers";

export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 30 }) => {
    const rows = await ctx.db
      .query("reels")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    const me = await getCurrentUser(ctx);
    return (
      await Promise.all(
        rows.map((reel) => enrichReel(ctx, reel._id, me?._id ?? null)),
      )
    ).filter(Boolean);
  },
});

export const byAuthor = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 20 }) => {
    const rows = await ctx.db
      .query("reels")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .take(limit);

    const me = await getCurrentUser(ctx);
    return (
      await Promise.all(
        rows.map((reel) => enrichReel(ctx, reel._id, me?._id ?? null)),
      )
    ).filter(Boolean);
  },
});

export const create = mutation({
  args: {
    videoStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { videoStorageId, caption }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Complete your profile first — visit /onboarding");

    const videoUrl = (await ctx.storage.getUrl(videoStorageId)) ?? undefined;
    if (!videoUrl) throw new Error("Video upload failed — try again");

    return await ctx.db.insert("reels", {
      authorId: user._id,
      videoStorageId,
      videoUrl,
      caption: caption?.trim() || undefined,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, { reelId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reel = await ctx.db.get(reelId);
    if (!reel || reel.authorId !== user._id) {
      throw new Error("Not allowed");
    }

    await ctx.storage.delete(reel.videoStorageId);

    const likes = await ctx.db
      .query("reelLikes")
      .withIndex("by_reel", (q) => q.eq("reelId", reelId))
      .collect();
    for (const like of likes) await ctx.db.delete(like._id);

    const comments = await ctx.db
      .query("reelComments")
      .withIndex("by_reel", (q) => q.eq("reelId", reelId))
      .collect();
    for (const comment of comments) await ctx.db.delete(comment._id);

    await ctx.db.delete(reelId);
  },
});

export const toggleLike = mutation({
  args: { reelId: v.id("reels") },
  handler: async (ctx, { reelId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reel = await ctx.db.get(reelId);
    if (!reel) throw new Error("Reel not found");

    const existing = await ctx.db
      .query("reelLikes")
      .withIndex("by_user_reel", (q) =>
        q.eq("userId", user._id).eq("reelId", reelId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("reelLikes", {
      reelId,
      userId: user._id,
      createdAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: reel.authorId,
      actorId: user._id,
      type: "reel_like",
      reelId,
      message: "liked your reel",
    });

    return { liked: true };
  },
});

export const listComments = query({
  args: { reelId: v.id("reels") },
  handler: async (ctx, { reelId }) => {
    const comments = await ctx.db
      .query("reelComments")
      .withIndex("by_reel", (q) => q.eq("reelId", reelId))
      .order("asc")
      .collect();

    return await Promise.all(
      comments.map(async (c) => ({
        ...c,
        author: await ctx.db.get(c.userId),
      })),
    );
  },
});

export const addComment = mutation({
  args: { reelId: v.id("reels"), content: v.string() },
  handler: async (ctx, { reelId, content }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reel = await ctx.db.get(reelId);
    if (!reel) throw new Error("Reel not found");

    const trimmed = content.trim();
    if (!trimmed) throw new Error("Comment cannot be empty");

    const id = await ctx.db.insert("reelComments", {
      reelId,
      userId: user._id,
      content: trimmed,
      createdAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: reel.authorId,
      actorId: user._id,
      type: "reel_comment",
      reelId,
      message: "commented on your reel",
    });

    return id;
  },
});

export const removeComment = mutation({
  args: { commentId: v.id("reelComments") },
  handler: async (ctx, { commentId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const comment = await ctx.db.get(commentId);
    if (!comment || comment.userId !== user._id) {
      throw new Error("Not allowed");
    }
    await ctx.db.delete(commentId);
  },
});
