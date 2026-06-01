import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { enrichPost, getCurrentUser } from "./helpers";

export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 30 }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    const me = await getCurrentUser(ctx);
    return (
      await Promise.all(
        posts.map((post) => enrichPost(ctx, post._id, me?._id ?? null)),
      )
    ).filter(Boolean);
  },
});

export const feedFollowing = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 30 }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", me._id))
      .collect();

    const authorIds = new Set([
      me._id,
      ...following.map((f) => f.followingId),
    ]);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(100);

    const filtered = posts
      .filter((p) => authorIds.has(p.authorId))
      .slice(0, limit);

    return (
      await Promise.all(
        filtered.map((post) => enrichPost(ctx, post._id, me._id)),
      )
    ).filter(Boolean);
  },
});

export const byAuthor = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 30 }) => {
    const me = await getCurrentUser(ctx);
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .take(limit);

    return (
      await Promise.all(
        posts.map((post) => enrichPost(ctx, post._id, me?._id ?? null)),
      )
    ).filter(Boolean);
  },
});

export const discover = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(12);

    const me = await getCurrentUser(ctx);
    return (
      await Promise.all(
        posts.map((post) => enrichPost(ctx, post._id, me?._id ?? null)),
      )
    ).filter(Boolean);
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Complete your profile first — visit /onboarding");

    const content = args.content.trim();
    if (!content && !args.imageStorageId) {
      throw new Error("Write something or add a photo.");
    }

    let imageUrl: string | undefined;
    if (args.imageStorageId) {
      imageUrl = (await ctx.storage.getUrl(args.imageStorageId)) ?? undefined;
    }

    return await ctx.db.insert("posts", {
      authorId: user._id,
      content: content || " ",
      imageUrl,
      imageStorageId: args.imageStorageId,
      topic: args.topic,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Complete your profile first — visit /onboarding");

    const post = await ctx.db.get(postId);
    if (!post || post.authorId !== user._id) {
      throw new Error("Not allowed");
    }

    if (post.imageStorageId) {
      await ctx.storage.delete(post.imageStorageId);
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const like of likes) await ctx.db.delete(like._id);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();
    for (const comment of comments) await ctx.db.delete(comment._id);

    await ctx.db.delete(postId);
  },
});
