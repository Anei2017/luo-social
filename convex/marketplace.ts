import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 40 }) => {
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    return await Promise.all(
      rows.map(async (item) => ({
        ...item,
        author: await ctx.db.get(item.authorId),
      })),
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priceLabel: v.optional(v.string()),
    contactHint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const title = args.title.trim();
    if (!title) throw new Error("Title required");

    return await ctx.db.insert("listings", {
      authorId: user._id,
      title,
      description: args.description.trim(),
      priceLabel: args.priceLabel?.trim() || undefined,
      contactHint: args.contactHint?.trim() || undefined,
      createdAt: Date.now(),
    });
  },
});
