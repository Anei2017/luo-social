import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const results = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, { postId }) => {
    const post = await ctx.db.get(postId);
    if (!post?.pollOptions?.length) return null;

    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_post", (q) => q.eq("postId", postId))
      .collect();

    const me = await getCurrentUser(ctx);
    const myVote = me
      ? votes.find((v) => v.userId === me._id)?.optionIndex
      : undefined;

    const counts = post.pollOptions.map((_, i) =>
      votes.filter((v) => v.optionIndex === i).length,
    );
    const total = counts.reduce((a, b) => a + b, 0);

    return {
      options: post.pollOptions,
      counts,
      total,
      myVote,
      pollEndsAt: post.pollEndsAt,
    };
  },
});

export const vote = mutation({
  args: { postId: v.id("posts"), optionIndex: v.number() },
  handler: async (ctx, { postId, optionIndex }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const post = await ctx.db.get(postId);
    if (!post?.pollOptions?.length) throw new Error("No poll on this post");
    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      throw new Error("Invalid option");
    }
    if (post.pollEndsAt && Date.now() > post.pollEndsAt) {
      throw new Error("Poll has ended");
    }

    const existing = await ctx.db
      .query("pollVotes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", user._id).eq("postId", postId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { optionIndex });
    } else {
      await ctx.db.insert("pollVotes", {
        postId,
        userId: user._id,
        optionIndex,
        createdAt: Date.now(),
      });
    }

    return { optionIndex };
  },
});
