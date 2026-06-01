import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export const feed = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const rows = (await ctx.db.query("stories").collect()).filter(
      (s) => s.expiresAt > now,
    );

    const byAuthor = new Map<string, typeof rows>();
    for (const s of rows) {
      const key = s.authorId;
      const list = byAuthor.get(key) ?? [];
      list.push(s);
      byAuthor.set(key, list);
    }

    const bundles = await Promise.all(
      [...byAuthor.entries()].map(async ([authorId, stories]) => {
        const author = await ctx.db.get(authorId as typeof stories[0]["authorId"]);
        const enriched = await Promise.all(
          stories
            .sort((a, b) => b.createdAt - a.createdAt)
            .map(async (story) => {
              let imageUrl = story.imageUrl;
              if (!imageUrl && story.imageStorageId) {
                imageUrl =
                  (await ctx.storage.getUrl(story.imageStorageId)) ?? undefined;
              }
              return { ...story, imageUrl };
            }),
        );
        return { author, stories: enriched };
      }),
    );

    return bundles.filter((b) => b.author && b.stories.length > 0);
  },
});

export const create = mutation({
  args: {
    imageStorageId: v.id("_storage"),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { imageStorageId, caption }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const imageUrl = (await ctx.storage.getUrl(imageStorageId)) ?? undefined;
    const now = Date.now();

    return await ctx.db.insert("stories", {
      authorId: user._id,
      imageStorageId,
      imageUrl,
      caption: caption?.trim() || undefined,
      createdAt: now,
      expiresAt: now + STORY_TTL_MS,
    });
  },
});
