import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .order("desc")
      .take(limit);

    return await Promise.all(
      items.map(async (n) => ({
        ...n,
        actor: await ctx.db.get(n.actorId),
      })),
    );
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return 0;

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    return items.filter((n) => !n.read).length;
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const items = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", me._id))
      .collect();

    for (const n of items) {
      if (!n.read) await ctx.db.patch(n._id, { read: true });
    }
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, { notificationId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const n = await ctx.db.get(notificationId);
    if (!n || n.userId !== me._id) throw new Error("Not found");
    await ctx.db.patch(notificationId, { read: true });
  },
});
