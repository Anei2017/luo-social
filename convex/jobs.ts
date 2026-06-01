import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 40 }) => {
    const rows = await ctx.db
      .query("jobs")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    return await Promise.all(
      rows.map(async (job) => ({
        ...job,
        author: await ctx.db.get(job.authorId),
      })),
    );
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    company: v.optional(v.string()),
    location: v.optional(v.string()),
    applyUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const title = args.title.trim();
    if (!title) throw new Error("Title required");

    return await ctx.db.insert("jobs", {
      authorId: user._id,
      title,
      description: args.description.trim(),
      company: args.company?.trim() || undefined,
      location: args.location?.trim() || undefined,
      applyUrl: args.applyUrl?.trim() || undefined,
      createdAt: Date.now(),
    });
  },
});
