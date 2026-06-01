import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./helpers";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username.toLowerCase()))
      .unique();
  },
});

export const upsertFromClerk = mutation({
  args: {
    username: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        avatarUrl: args.avatarUrl ?? existing.avatarUrl,
        bio: args.bio ?? existing.bio,
      });
      return existing._id;
    }

    const clean = args.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    const taken = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", clean))
      .unique();
    if (taken) throw new Error("Username already taken");

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      username: clean,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
      bio: args.bio,
      skills: [],
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const patch: Record<string, unknown> = {};
    if (args.displayName !== undefined) {
      patch.displayName = args.displayName.trim() || me.displayName;
    }
    if (args.bio !== undefined) patch.bio = args.bio.trim() || undefined;
    if (args.avatarUrl !== undefined) patch.avatarUrl = args.avatarUrl;
    if (args.skills !== undefined) patch.skills = args.skills;

    await ctx.db.patch(me._id, patch);
    return me._id;
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchQuery }) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const all = await ctx.db.query("users").collect();
    return all
      .filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q),
      )
      .slice(0, 12);
  },
});
