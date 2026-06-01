import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getCurrentUser, pushNotification } from "./helpers";

export const toggle = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post) throw new Error("Post not found");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", postId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", {
      postId,
      userId: user._id,
      createdAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: post.authorId,
      actorId: user._id,
      type: "like",
      postId,
      message: "liked your post",
    });

    return { liked: true };
  },
});
