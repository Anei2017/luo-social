import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { enrichPost, getBlockedIds, getCurrentUser } from "./helpers";

function extractHashtags(text: string): string[] {
  const tags = new Set<string>();
  for (const match of text.matchAll(/#([a-zA-Z0-9_\u00C0-\u024F]+)/g)) {
    const tag = match[1]?.toLowerCase();
    if (tag && tag.length <= 32) tags.add(tag);
  }
  return [...tags].slice(0, 12);
}

async function filterVisiblePosts<T extends { authorId: Id<"users"> }>(
  ctx: QueryCtx,
  posts: T[],
  meId: Id<"users"> | null,
) {
  if (!meId) return posts;
  const blocked = await getBlockedIds(ctx, meId);
  return posts.filter((p) => p.authorId !== meId && !blocked.has(p.authorId));
}

const FEED_TOPICS = [
  "Community",
  "Culture",
  "Music",
  "Business",
  "Diaspora",
] as const;

function matchesTopic(post: { topic?: string }, topic?: string) {
  if (!topic || topic === "All") return true;
  return post.topic === topic;
}

async function enrichFilteredPosts(
  ctx: QueryCtx,
  posts: { _id: Id<"posts">; authorId: Id<"users">; topic?: string }[],
  meId: Id<"users"> | null,
  limit: number,
  topic?: string,
) {
  const filtered = posts.filter((p) => matchesTopic(p, topic)).slice(0, limit);
  return (
    await Promise.all(
      filtered.map((post) => enrichPost(ctx, post._id, meId)),
    )
  ).filter(Boolean);
}

export const feedTopics = query({
  args: {},
  handler: async () => [...FEED_TOPICS],
});

export const feed = query({
  args: {
    limit: v.optional(v.number()),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 40, topic }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(topic && topic !== "All" ? 120 : limit);

    const me = await getCurrentUser(ctx);
    const visible = await filterVisiblePosts(ctx, posts, me?._id ?? null);
    return await enrichFilteredPosts(
      ctx,
      visible,
      me?._id ?? null,
      limit,
      topic,
    );
  },
});

const feedTab = v.union(
  v.literal("everyone"),
  v.literal("friends"),
  v.literal("following"),
);

/** Cursor-based feed page for infinite scroll (use via /api/posts?cursor=…) */
export const feedPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    topic: v.optional(v.string()),
    tab: feedTab,
  },
  handler: async (ctx, { paginationOpts, topic, tab }) => {
    const me = await getCurrentUser(ctx);
    const meId = me?._id ?? null;

    if ((tab === "friends" || tab === "following") && !me) {
      return { page: [], continueCursor: "", isDone: true };
    }

    let authorIds: Set<Id<"users">> | null = null;
    if (tab === "friends" && me) {
      authorIds = await authorIdsForFriends(ctx, me._id);
    } else if (tab === "following" && me) {
      const following = await ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", me._id))
        .collect();
      authorIds = new Set<Id<"users">>([
        me._id,
        ...following.map((f) => f.followingId),
      ]);
    }

    const batch = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .paginate(paginationOpts);

    let page = batch.page;
    if (authorIds) {
      page = page.filter((p) => authorIds!.has(p.authorId));
    }
    const visible = await filterVisiblePosts(ctx, page, meId);
    const filtered = visible.filter((p) => matchesTopic(p, topic));

    const enriched = (
      await Promise.all(
        filtered.map((post) => enrichPost(ctx, post._id, meId)),
      )
    ).filter(Boolean);

    return {
      page: enriched,
      continueCursor: batch.continueCursor,
      isDone: batch.isDone,
    };
  },
});

export const culturalFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 40 }) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(150);

    const me = await getCurrentUser(ctx);
    const cultural = posts.filter(
      (p) =>
        p.topic === "Culture" ||
        p.hashtags?.some((t) =>
          ["luoculture", "dholuoproverbs", "luomusic", "luokitchen", "nyatiti"].includes(
            t.toLowerCase(),
          ),
        ),
    );
    const visible = await filterVisiblePosts(ctx, cultural, me?._id ?? null);
    return await enrichFilteredPosts(ctx, visible, me?._id ?? null, limit);
  },
});

export const byHashtag = query({
  args: { tag: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { tag, limit = 40 }) => {
    const normalized = tag.replace(/^#/, "").toLowerCase();
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(150);

    const me = await getCurrentUser(ctx);
    const tagged = posts.filter((p) =>
      p.hashtags?.some((t) => t.toLowerCase() === normalized),
    );
    const visible = await filterVisiblePosts(ctx, tagged, me?._id ?? null);
    return await enrichFilteredPosts(ctx, visible, me?._id ?? null, limit);
  },
});

async function authorIdsForFriends(ctx: QueryCtx, userId: Id<"users">) {
  const rows = await ctx.db.query("friendships").collect();
  const ids = new Set<Id<"users">>([userId]);
  for (const r of rows) {
    if (
      r.status === "accepted" &&
      (r.userA === userId || r.userB === userId)
    ) {
      ids.add(r.userA === userId ? r.userB : r.userA);
    }
  }
  return ids;
}

export const feedFriends = query({
  args: {
    limit: v.optional(v.number()),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 40, topic }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const authorIds = await authorIdsForFriends(ctx, me._id);
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(120);

    const filtered = posts.filter((p) => authorIds.has(p.authorId));
    const visible = await filterVisiblePosts(ctx, filtered, me._id);
    return await enrichFilteredPosts(ctx, visible, me._id, limit, topic);
  },
});

export const feedFollowing = query({
  args: {
    limit: v.optional(v.number()),
    topic: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 40, topic }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", me._id))
      .collect();

    const authorIds = new Set<Id<"users">>([
      me._id,
      ...following.map((f) => f.followingId),
    ]);

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_created")
      .order("desc")
      .take(120);

    const filtered = posts.filter((p) => authorIds.has(p.authorId));
    const visible = await filterVisiblePosts(ctx, filtered, me._id);
    return await enrichFilteredPosts(ctx, visible, me._id, limit, topic);
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
    language: v.optional(
      v.union(v.literal("english"), v.literal("dholuo"), v.literal("both")),
    ),
    groupId: v.optional(v.id("groups")),
    pollOptions: v.optional(v.array(v.string())),
    pollDurationHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Complete your profile first — visit /onboarding");

    const content = args.content.trim();
    const pollOptions = args.pollOptions
      ?.map((o) => o.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (!content && !args.imageStorageId && !pollOptions?.length) {
      throw new Error("Write something, add a photo, or add a poll.");
    }

    let imageUrl: string | undefined;
    if (args.imageStorageId) {
      imageUrl = (await ctx.storage.getUrl(args.imageStorageId)) ?? undefined;
    }

    const hashtags = extractHashtags(content);
    let pollEndsAt: number | undefined;
    if (pollOptions && pollOptions.length >= 2) {
      const hours = args.pollDurationHours ?? 48;
      pollEndsAt = Date.now() + hours * 60 * 60 * 1000;
    }

    return await ctx.db.insert("posts", {
      authorId: user._id,
      content: content || " ",
      imageUrl,
      imageStorageId: args.imageStorageId,
      topic: args.topic,
      hashtags: hashtags.length ? hashtags : undefined,
      language: args.language,
      groupId: args.groupId,
      pollOptions:
        pollOptions && pollOptions.length >= 2 ? pollOptions : undefined,
      pollEndsAt,
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
