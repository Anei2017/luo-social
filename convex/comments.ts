import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, pushNotification } from "./helpers";

export const listByPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .order("asc")
      .collect();

    return await Promise.all(
      comments.map(async (comment) => ({
        ...comment,
        author: await ctx.db.get(comment.userId),
      })),
    );
  },
});

export const listByAuthor = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 40 }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    return Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.userId);
        const post = await ctx.db.get(comment.postId);
        return {
          ...comment,
          author,
          post: post
            ? { _id: post._id, content: post.content.slice(0, 160) }
            : null,
        };
      }),
    );
  },
});

/** Profile "Replies" tab — paginated comments */
export const byAuthorPaginated = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { userId, paginationOpts }) => {
    const batch = await ctx.db
      .query("comments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(paginationOpts);

    const page = await Promise.all(
      batch.page.map(async (comment) => {
        const author = await ctx.db.get(comment.userId);
        const post = await ctx.db.get(comment.postId);
        return {
          ...comment,
          author,
          post: post
            ? {
                _id: post._id,
                content: post.content.slice(0, 120),
                authorId: post.authorId,
              }
            : null,
        };
      }),
    );

    return { page, continueCursor: batch.continueCursor, isDone: batch.isDone };
  },
});

export const remove = mutation({
  args: { commentId: v.id("comments") },
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

export const add = mutation({
  args: { postId: v.id("posts"), content: v.string() },
  handler: async (ctx, { postId, content }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const trimmed = content.trim();
    if (!trimmed) throw new Error("Comment cannot be empty");

    const id = await ctx.db.insert("comments", {
      postId,
      userId: user._id,
      content: trimmed,
      createdAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: post.authorId,
      actorId: user._id,
      type: "comment",
      postId,
      message: "commented on your post",
    });

    return id;
  },
});
