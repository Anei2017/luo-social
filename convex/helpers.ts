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

export async function enrichPost(ctx: Ctx, postId: Id<"posts">, meId: Id<"users"> | null) {
  const post = await ctx.db.get(postId);
  if (!post) return null;
  const author = await ctx.db.get(post.authorId);
  let imageUrl = post.imageUrl;
  if (!imageUrl && post.imageStorageId) {
    imageUrl = (await ctx.storage.getUrl(post.imageStorageId)) ?? undefined;
  }
  const likeCount = (
    await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect()
  ).length;
  const commentCount = (
    await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect()
  ).length;
  let likedByMe = false;
  if (meId) {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_post", (q) =>
        q.eq("userId", meId).eq("postId", post._id),
      )
      .unique();
    likedByMe = !!like;
  }
  return {
    ...post,
    imageUrl,
    author,
    likeCount,
    commentCount,
    likedByMe,
  };
}

export async function pushNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    actorId: Id<"users">;
    type: "like" | "comment" | "follow" | "message";
    message: string;
    postId?: Id<"posts">;
  },
) {
  if (args.userId === args.actorId) return;

  await ctx.db.insert("notifications", {
    userId: args.userId,
    actorId: args.actorId,
    type: args.type,
    postId: args.postId,
    message: args.message,
    read: false,
    createdAt: Date.now(),
  });
}
