import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    skills: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_username", ["username"]),

  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    topic: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_author", ["authorId", "createdAt"]),

  likes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  comments: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_post", ["postId", "createdAt"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

  notifications: defineTable({
    userId: v.id("users"),
    actorId: v.id("users"),
    type: v.union(
      v.literal("like"),
      v.literal("comment"),
      v.literal("follow"),
      v.literal("message"),
    ),
    postId: v.optional(v.id("posts")),
    message: v.string(),
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId", "createdAt"]),

  conversations: defineTable({
    memberA: v.id("users"),
    memberB: v.id("users"),
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
  }).index("by_members", ["memberA", "memberB"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId", "createdAt"]),
});
