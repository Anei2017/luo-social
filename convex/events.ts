import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const list = query({
  args: { upcomingOnly: v.optional(v.boolean()) },
  handler: async (ctx, { upcomingOnly = true }) => {
    const now = Date.now();
    let rows = await ctx.db.query("events").withIndex("by_starts").order("asc").collect();
    if (upcomingOnly) rows = rows.filter((e) => e.startsAt >= now - 86400000);
    rows.sort((a, b) => a.startsAt - b.startsAt);

    const me = await getCurrentUser(ctx);
    return await Promise.all(
      rows.map(async (event) => {
        const author = await ctx.db.get(event.authorId);
        const rsvps = await ctx.db
          .query("eventRsvps")
          .withIndex("by_event", (q) => q.eq("eventId", event._id))
          .collect();
        const myRsvp = me
          ? rsvps.find((r) => r.userId === me._id)?.status
          : undefined;
        return {
          ...event,
          author,
          goingCount: rsvps.filter((r) => r.status === "going").length,
          interestedCount: rsvps.filter((r) => r.status === "interested").length,
          myRsvp,
        };
      }),
    );
  },
});

export const byAuthor = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 20 }) => {
    const rows = await ctx.db.query("events").collect();
    const mine = rows
      .filter((e) => e.authorId === userId)
      .sort((a, b) => b.startsAt - a.startsAt)
      .slice(0, limit);
    return mine;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    virtualLink: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const title = args.title.trim();
    if (!title) throw new Error("Title required");

    return await ctx.db.insert("events", {
      authorId: user._id,
      title,
      description: args.description.trim(),
      location: args.location?.trim() || undefined,
      virtualLink: args.virtualLink?.trim() || undefined,
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      createdAt: Date.now(),
    });
  },
});

export const rsvp = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(v.literal("going"), v.literal("interested")),
  },
  handler: async (ctx, { eventId, status }) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("eventRsvps")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", user._id).eq("eventId", eventId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { status });
      return { status };
    }

    await ctx.db.insert("eventRsvps", {
      eventId,
      userId: user._id,
      status,
      createdAt: Date.now(),
    });
    return { status };
  },
});
