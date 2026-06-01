import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { getCurrentUser, pushNotification } from "./helpers";

function sortPair(
  a: Id<"users">,
  b: Id<"users">,
): [Id<"users">, Id<"users">] {
  return a < b ? [a, b] : [b, a];
}

async function getFriendship(
  ctx: Pick<QueryCtx, "db">,
  a: Id<"users">,
  b: Id<"users">,
) {
  const [userA, userB] = sortPair(a, b);
  return await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q) => q.eq("userA", userA).eq("userB", userB))
    .unique();
}

async function friendsForUser(
  ctx: QueryCtx,
  userId: Id<"users">,
  limit: number,
) {
  const rows = await ctx.db.query("friendships").collect();
  const accepted = rows
    .filter(
      (r) =>
        r.status === "accepted" &&
        (r.userA === userId || r.userB === userId),
    )
    .sort((a, b) => (b.acceptedAt ?? b.createdAt) - (a.acceptedAt ?? a.createdAt))
    .slice(0, limit);

  const result: {
    friendshipId: Id<"friendships">;
    user: Doc<"users">;
    since: number;
  }[] = [];

  for (const r of accepted) {
    const friendId = r.userA === userId ? r.userB : r.userA;
    const user = await ctx.db.get(friendId);
    if (user) {
      result.push({
        friendshipId: r._id,
        user,
        since: r.acceptedAt ?? r.createdAt,
      });
    }
  }
  return result;
}

export const statusWith = query({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const me = await getCurrentUser(ctx);
    if (!me || me._id === otherUserId) {
      return { status: "none" as const };
    }

    const row = await getFriendship(ctx, me._id, otherUserId);
    if (!row) return { status: "none" as const };
    if (row.status === "accepted") return { status: "friends" as const };
    if (row.requestedBy === me._id) return { status: "pending_out" as const };
    return { status: "pending_in" as const };
  },
});

export const stats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const rows = await ctx.db.query("friendships").collect();
    const count = rows.filter(
      (r) =>
        r.status === "accepted" &&
        (r.userA === userId || r.userB === userId),
    ).length;
    return { friends: count };
  },
});

export const listForUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, { userId, limit = 48 }) => {
    return await friendsForUser(ctx, userId, limit);
  },
});

export const listPendingIncoming = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const rows = await ctx.db.query("friendships").collect();
    const pending = rows
      .filter(
        (r) =>
          r.status === "pending" &&
          r.requestedBy !== me._id &&
          (r.userA === me._id || r.userB === me._id),
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    const result: {
      friendshipId: Id<"friendships">;
      user: Doc<"users">;
      createdAt: number;
    }[] = [];
    for (const r of pending) {
      const otherId = r.userA === me._id ? r.userB : r.userA;
      const user = await ctx.db.get(otherId);
      if (user) {
        result.push({ friendshipId: r._id, user, createdAt: r.createdAt });
      }
    }
    return result;
  },
});

export const listPendingOutgoing = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const rows = await ctx.db.query("friendships").collect();
    const pending = rows
      .filter(
        (r) =>
          r.status === "pending" &&
          r.requestedBy === me._id &&
          (r.userA === me._id || r.userB === me._id),
      )
      .sort((a, b) => b.createdAt - a.createdAt);

    const result: {
      friendshipId: Id<"friendships">;
      user: Doc<"users">;
      createdAt: number;
    }[] = [];
    for (const r of pending) {
      const otherId = r.userA === me._id ? r.userB : r.userA;
      const user = await ctx.db.get(otherId);
      if (user) {
        result.push({ friendshipId: r._id, user, createdAt: r.createdAt });
      }
    }
    return result;
  },
});

export const listMyFriends = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 80 }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];
    return await friendsForUser(ctx, me._id, limit);
  },
});

export const sendRequest = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    if (me._id === otherUserId) throw new Error("Cannot add yourself");

    const other = await ctx.db.get(otherUserId);
    if (!other) throw new Error("User not found");

    const existing = await getFriendship(ctx, me._id, otherUserId);
    if (existing) {
      if (existing.status === "accepted") throw new Error("Already friends");
      if (existing.requestedBy === me._id) throw new Error("Request already sent");
      if (existing.requestedBy === otherUserId) {
        await ctx.db.patch(existing._id, {
          status: "accepted",
          acceptedAt: Date.now(),
        });
        await pushNotification(ctx, {
          userId: otherUserId,
          actorId: me._id,
          type: "friend_accept",
          message: "is now your friend",
        });
        return { status: "friends" as const };
      }
    }

    const [userA, userB] = sortPair(me._id, otherUserId);
    await ctx.db.insert("friendships", {
      userA,
      userB,
      status: "pending",
      requestedBy: me._id,
      createdAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: otherUserId,
      actorId: me._id,
      type: "friend_request",
      message: "sent you a friend request",
    });

    return { status: "pending_out" as const };
  },
});

export const acceptRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, { friendshipId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const row = await ctx.db.get(friendshipId);
    if (!row || row.status !== "pending") throw new Error("Request not found");
    if (row.userA !== me._id && row.userB !== me._id) {
      throw new Error("Not allowed");
    }
    if (row.requestedBy === me._id) {
      throw new Error("You cannot accept your own request");
    }

    await ctx.db.patch(friendshipId, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    await pushNotification(ctx, {
      userId: row.requestedBy,
      actorId: me._id,
      type: "friend_accept",
      message: "accepted your friend request",
    });

    return { ok: true };
  },
});

export const declineRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, { friendshipId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const row = await ctx.db.get(friendshipId);
    if (!row || row.status !== "pending") throw new Error("Request not found");
    if (row.userA !== me._id && row.userB !== me._id) {
      throw new Error("Not allowed");
    }
    if (row.requestedBy === me._id) {
      throw new Error("Cancel your sent request instead");
    }

    await ctx.db.delete(friendshipId);
    return { ok: true };
  },
});

export const cancelRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, { friendshipId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const row = await ctx.db.get(friendshipId);
    if (!row || row.status !== "pending" || row.requestedBy !== me._id) {
      throw new Error("Request not found");
    }

    await ctx.db.delete(friendshipId);
    return { ok: true };
  },
});

export const removeFriend = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const row = await getFriendship(ctx, me._id, otherUserId);
    if (!row) throw new Error("Not friends");

    await ctx.db.delete(row._id);
    return { ok: true };
  },
});
