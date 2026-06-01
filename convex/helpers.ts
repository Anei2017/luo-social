import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function getCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

export async function getBlockedIds(ctx: Ctx, userId: Id<"users">) {
  const rows = await ctx.db
    .query("blocks")
    .withIndex("by_blocker", (q) => q.eq("blockerId", userId))
    .collect();
  return new Set(rows.map((r) => r.blockedId));
}

export async function enrichReel(ctx: Ctx, reelId: Id<"reels">, meId: Id<"users"> | null) {
  const reel = await ctx.db.get(reelId);
  if (!reel) return null;
  const author = await ctx.db.get(reel.authorId);
  let videoUrl = reel.videoUrl;
  if (!videoUrl) {
    videoUrl = (await ctx.storage.getUrl(reel.videoStorageId)) ?? undefined;
  }
  const likeCount = (
    await ctx.db
      .query("reelLikes")
      .withIndex("by_reel", (q) => q.eq("reelId", reel._id))
      .collect()
  ).length;
  const commentCount = (
    await ctx.db
      .query("reelComments")
      .withIndex("by_reel", (q) => q.eq("reelId", reel._id))
      .collect()
  ).length;
  let likedByMe = false;
  if (meId) {
    const like = await ctx.db
      .query("reelLikes")
      .withIndex("by_user_reel", (q) =>
        q.eq("userId", meId).eq("reelId", reel._id),
      )
      .unique();
    likedByMe = !!like;
  }
  return {
    ...reel,
    videoUrl,
    author,
    likeCount,
    commentCount,
    likedByMe,
  };
}

export async function enrichPost(ctx: Ctx, postId: Id<"posts">, meId: Id<"users"> | null) {
  const post = await ctx.db.get(postId);
  if (!post) return null;
  const author = await ctx.db.get(post.authorId);
  let imageUrl = post.imageUrl;
  if (!imageUrl && post.imageStorageId) {
    imageUrl = (await ctx.storage.getUrl(post.imageStorageId)) ?? undefined;
  }

  const reactions = await ctx.db
    .query("postReactions")
    .withIndex("by_post", (q) => q.eq("postId", post._id))
    .collect();

  const legacyLikes = await ctx.db
    .query("likes")
    .withIndex("by_post", (q) => q.eq("postId", post._id))
    .collect();

  const reactionCounts = {
    like: 0,
    love: 0,
    laugh: 0,
    sad: 0,
    wow: 0,
  };
  for (const r of reactions) {
    reactionCounts[r.reaction] += 1;
  }
  const likeCount = reactions.length + legacyLikes.length;
  const commentCount = (
    await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect()
  ).length;

  let myReaction: string | null = null;
  let likedByMe = false;
  if (meId) {
    const mine = await ctx.db
      .query("postReactions")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", meId).eq("postId", post._id),
      )
      .unique();
    if (mine) {
      myReaction = mine.reaction;
      likedByMe = mine.reaction === "like";
    } else {
      const legacy = await ctx.db
        .query("likes")
        .withIndex("by_user_post", (q) =>
          q.eq("userId", meId).eq("postId", post._id),
        )
        .unique();
      likedByMe = !!legacy;
      if (legacy) myReaction = "like";
    }
  }

  let poll: {
    options: string[];
    counts: number[];
    total: number;
    myVote?: number;
    pollEndsAt?: number;
  } | null = null;

  if (post.pollOptions?.length) {
    const votes = await ctx.db
      .query("pollVotes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();
    const counts = post.pollOptions.map((_, i) =>
      votes.filter((v) => v.optionIndex === i).length,
    );
    poll = {
      options: post.pollOptions,
      counts,
      total: counts.reduce((a, b) => a + b, 0),
      myVote: meId ? votes.find((v) => v.userId === meId)?.optionIndex : undefined,
      pollEndsAt: post.pollEndsAt,
    };
  }

  return {
    ...post,
    imageUrl,
    author,
    likeCount,
    commentCount,
    likedByMe,
    myReaction,
    reactionCounts,
    poll,
  };
}

export async function pushNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    actorId: Id<"users">;
    type:
      | "like"
      | "comment"
      | "follow"
      | "message"
      | "friend_request"
      | "friend_accept"
      | "reel_like"
      | "reel_comment";
    message: string;
    postId?: Id<"posts">;
    reelId?: Id<"reels">;
  },
) {
  if (args.userId === args.actorId) return;

  await ctx.db.insert("notifications", {
    userId: args.userId,
    actorId: args.actorId,
    type: args.type,
    postId: args.postId,
    reelId: args.reelId,
    message: args.message,
    read: false,
    createdAt: Date.now(),
  });
}
