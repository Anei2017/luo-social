import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
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
    clan: v.optional(v.string()),
    hometown: v.optional(v.string()),
    language: v.optional(
      v.union(v.literal("english"), v.literal("dholuo"), v.literal("both")),
    ),
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
        clan: args.clan?.trim() ?? existing.clan,
        hometown: args.hometown?.trim() ?? existing.hometown,
        language: args.language ?? existing.language,
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
      clan: args.clan?.trim() || undefined,
      hometown: args.hometown?.trim() || undefined,
      language: args.language ?? "both",
      skills: [],
      email: identity.email,
      role: "member",
      createdAt: Date.now(),
    });
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    coverStorageId: v.optional(v.id("_storage")),
    coverUrl: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    clan: v.optional(v.string()),
    hometown: v.optional(v.string()),
    currentLocation: v.optional(v.string()),
    occupation: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    language: v.optional(
      v.union(v.literal("english"), v.literal("dholuo"), v.literal("both")),
    ),
    proudLuo: v.optional(v.boolean()),
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
    if (args.avatarStorageId !== undefined) {
      patch.avatarUrl =
        (await ctx.storage.getUrl(args.avatarStorageId)) ?? undefined;
    }
    if (args.coverStorageId !== undefined) {
      patch.coverUrl =
        (await ctx.storage.getUrl(args.coverStorageId)) ?? undefined;
    }
    if (args.coverUrl !== undefined) patch.coverUrl = args.coverUrl;
    if (args.skills !== undefined) patch.skills = args.skills;
    if (args.clan !== undefined) patch.clan = args.clan.trim() || undefined;
    if (args.hometown !== undefined) {
      patch.hometown = args.hometown.trim() || undefined;
    }
    if (args.currentLocation !== undefined) {
      patch.currentLocation = args.currentLocation.trim() || undefined;
    }
    if (args.occupation !== undefined) {
      patch.occupation = args.occupation.trim() || undefined;
    }
    if (args.interests !== undefined) patch.interests = args.interests;
    if (args.proudLuo !== undefined) patch.proudLuo = args.proudLuo;
    if (args.language !== undefined) patch.language = args.language;

    await ctx.db.patch(me._id, patch);
    return me._id;
  },
});

/** Suggest Luos by hometown, interests, and mutual connections */
export const peopleYouMayKnow = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 8 }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", me._id))
      .collect();
    const followingIds = new Set(following.map((f) => f.followingId));

    const friendships = await ctx.db.query("friendships").collect();
    const friendIds = new Set<Id<"users">>();
    for (const f of friendships) {
      if (f.status === "accepted" && (f.userA === me._id || f.userB === me._id)) {
        friendIds.add(f.userA === me._id ? f.userB : f.userA);
      }
    }

    const all = await ctx.db.query("users").collect();
    const scored = all
      .filter((u) => u._id !== me._id && !followingIds.has(u._id))
      .map((u) => {
        let score = 0;
        if (me.hometown && u.hometown && me.hometown === u.hometown) score += 3;
        if (me.clan && u.clan && me.clan === u.clan) score += 2;
        if (friendIds.has(u._id)) score += 1;
        const sharedInterests = (me.interests ?? []).filter((i) =>
          (u.interests ?? []).includes(i),
        ).length;
        score += sharedInterests;
        return { user: u, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    if (scored.length < limit) {
      const extras = all
        .filter(
          (u) =>
            u._id !== me._id &&
            !followingIds.has(u._id) &&
            !scored.some((s) => s.user._id === u._id),
        )
        .slice(0, limit - scored.length)
        .map((u) => ({ user: u, score: 0 }));
      scored.push(...extras);
    }

    return scored.map((s) => s.user);
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

/** All community members — any signed-in user can browse and message anyone */
export const listMembers = query({
  args: {
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, limit = 80 }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const q = search?.trim().toLowerCase() ?? "";
    let all = await ctx.db.query("users").collect();
    all = all.filter((u) => u._id !== me._id);

    if (q) {
      all = all.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q),
      );
    }

    all.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return all.slice(0, limit);
  },
});
