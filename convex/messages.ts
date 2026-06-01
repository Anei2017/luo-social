import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUser, pushNotification } from "./helpers";

function sortPair(a: Id<"users">, b: Id<"users">): [Id<"users">, Id<"users">] {
  return a < b ? [a, b] : [b, a];
}

export const listConversations = query({
  args: {},
  handler: async (ctx) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const all = await ctx.db.query("conversations").collect();
    const mine = all.filter(
      (c) => c.memberA === me._id || c.memberB === me._id,
    );
    mine.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    return await Promise.all(
      mine.map(async (c) => {
        const otherId = c.memberA === me._id ? c.memberB : c.memberA;
        const other = await ctx.db.get(otherId);
        return { ...c, other };
      }),
    );
  },
});

export const getOrCreate = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, { otherUserId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");
    if (me._id === otherUserId) throw new Error("Cannot message yourself");

    const other = await ctx.db.get(otherUserId);
    if (!other) throw new Error("User not found");

    const [memberA, memberB] = sortPair(me._id, otherUserId);
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_members", (q) =>
        q.eq("memberA", memberA).eq("memberB", memberB),
      )
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("conversations", {
      memberA,
      memberB,
      lastMessageAt: Date.now(),
      lastMessagePreview: undefined,
    });
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) return [];

    const conv = await ctx.db.get(conversationId);
    if (!conv || (conv.memberA !== me._id && conv.memberB !== me._id)) {
      return [];
    }

    const rows = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("asc")
      .collect();

    return await Promise.all(
      rows.map(async (m) => {
        let imageUrl = m.imageUrl;
        if (!imageUrl && m.imageStorageId) {
          imageUrl = (await ctx.storage.getUrl(m.imageStorageId)) ?? undefined;
        }
        return {
          ...m,
          imageUrl,
          sender: await ctx.db.get(m.senderId),
        };
      }),
    );
  },
});

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { conversationId, content, imageStorageId }) => {
    const me = await getCurrentUser(ctx);
    if (!me) throw new Error("Not authenticated");

    const conv = await ctx.db.get(conversationId);
    if (!conv || (conv.memberA !== me._id && conv.memberB !== me._id)) {
      throw new Error("Conversation not found");
    }

    const trimmed = content.trim();
    if (!trimmed && !imageStorageId) {
      throw new Error("Message cannot be empty");
    }

    let imageUrl: string | undefined;
    if (imageStorageId) {
      imageUrl = (await ctx.storage.getUrl(imageStorageId)) ?? undefined;
    }

    const preview = trimmed
      ? trimmed.slice(0, 80)
      : imageStorageId
        ? "📷 Photo"
        : "";

    await ctx.db.insert("messages", {
      conversationId,
      senderId: me._id,
      content: trimmed || " ",
      imageUrl,
      imageStorageId,
      createdAt: Date.now(),
    });

    await ctx.db.patch(conversationId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: preview,
    });

    const recipientId =
      conv.memberA === me._id ? conv.memberB : conv.memberA;

    await pushNotification(ctx, {
      userId: recipientId,
      actorId: me._id,
      type: "message",
      message: "sent you a message",
    });

    return { ok: true };
  },
});
