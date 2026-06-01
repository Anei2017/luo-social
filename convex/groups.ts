import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { enrichPost, getCurrentUser } from "./helpers";

const DEFAULT_GROUPS = [
  {
    slug: "luo-brisbane",
    name: "Luo in Brisbane",
    description: "Connect with Luos living in Brisbane and Queensland.",
    location: "Brisbane, Australia",
  },
  {
    slug: "luo-nairobi",
    name: "Luo in Nairobi",
    description: "News, events, and meetups for the Nairobi Luo community.",
    location: "Nairobi, Kenya",
  },
  {
    slug: "luo-students",
    name: "Luo Students",
    description: "Study groups, advice, and support for Luo students worldwide.",
    location: "Global",
  },
  {
    slug: "luo-business",
    name: "Luo Business Network",
    description: "Entrepreneurs, professionals, and business opportunities.",
    location: "Global",
  },
  {
    slug: "luo-culture",
    name: "Luo Culture & Heritage",
    description: "Traditions, proverbs, music, and cultural preservation.",
    location: "Global",
  },
] as const;

async function ensureDefaultGroups(ctx: MutationCtx, creatorId: Id<"users">) {
  const existing = await ctx.db.query("groups").collect();
  if (existing.length > 0) return;

  for (const g of DEFAULT_GROUPS) {
    const groupId = await ctx.db.insert("groups", {
      ...g,
      createdBy: creatorId,
      createdAt: Date.now(),
    });
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: creatorId,
      role: "admin",
      joinedAt: Date.now(),
    });
  }
}

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    await ensureDefaultGroups(ctx, me._id);
    return { ok: true };
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);

    const groups = await ctx.db.query("groups").collect();
    return await Promise.all(
      groups.map(async (g) => {
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", g._id))
          .collect();
        const isMember = me
          ? members.some((m) => m.userId === me._id)
          : false;
        return { ...g, memberCount: members.length, isMember };
      }),
    );
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const me = await getCurrentUser(ctx);

    const group = await ctx.db
      .query("groups")
      .withIndex("by_slug", (q) => q.eq("slug", slug.toLowerCase()))
      .unique();
    if (!group) return null;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .collect();

    return {
      ...group,
      memberCount: members.length,
      isMember: me ? members.some((m) => m.userId === me._id) : false,
    };
  },
});

export const feed = query({
  args: { groupId: v.id("groups"), limit: v.optional(v.number()) },
  handler: async (ctx, { groupId, limit = 30 }) => {
    const me = await getCurrentUser(ctx);
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .order("desc")
      .take(limit);

    return (
      await Promise.all(
        posts.map((p) => enrichPost(ctx, p._id, me?._id ?? null)),
      )
    ).filter(Boolean);
  },
});

export const join = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) =>
        q.eq("userId", me._id).eq("groupId", groupId),
      )
      .unique();
    if (existing) return { joined: true };

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: me._id,
      role: "member",
      joinedAt: Date.now(),
    });
    return { joined: true };
  },
});

export const leave = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, { groupId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("groupMembers")
      .withIndex("by_user_group", (q) =>
        q.eq("userId", me._id).eq("groupId", groupId),
      )
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return { ok: true };
  },
});
