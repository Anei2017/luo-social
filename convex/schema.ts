import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
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
    isVerified: v.optional(v.boolean()),
    proudLuo: v.optional(v.boolean()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("member"),
        v.literal("moderator"),
        v.literal("super_admin"),
      ),
    ),
    banned: v.optional(v.boolean()),
    banReason: v.optional(v.string()),
    suspendedUntil: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_role", ["role"]),

  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    topic: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    language: v.optional(
      v.union(v.literal("english"), v.literal("dholuo"), v.literal("both")),
    ),
    groupId: v.optional(v.id("groups")),
    pollOptions: v.optional(v.array(v.string())),
    pollEndsAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_author", ["authorId", "createdAt"])
    .index("by_group", ["groupId", "createdAt"]),

  postReactions: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    reaction: v.union(
      v.literal("like"),
      v.literal("love"),
      v.literal("laugh"),
      v.literal("sad"),
      v.literal("wow"),
    ),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

  pollVotes: defineTable({
    postId: v.id("posts"),
    userId: v.id("users"),
    optionIndex: v.number(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user_post", ["userId", "postId"]),

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
  })
    .index("by_post", ["postId", "createdAt"])
    .index("by_user", ["userId", "createdAt"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

  friendships: defineTable({
    userA: v.id("users"),
    userB: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted")),
    requestedBy: v.id("users"),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  }).index("by_pair", ["userA", "userB"]),

  notifications: defineTable({
    userId: v.id("users"),
    actorId: v.id("users"),
    type: v.union(
      v.literal("like"),
      v.literal("comment"),
      v.literal("follow"),
      v.literal("message"),
      v.literal("friend_request"),
      v.literal("friend_accept"),
      v.literal("reel_like"),
      v.literal("reel_comment"),
    ),
    postId: v.optional(v.id("posts")),
    reelId: v.optional(v.id("reels")),
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

  reels: defineTable({
    authorId: v.id("users"),
    videoStorageId: v.id("_storage"),
    videoUrl: v.optional(v.string()),
    caption: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_created", ["createdAt"])
    .index("by_author", ["authorId", "createdAt"]),

  reelLikes: defineTable({
    reelId: v.id("reels"),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_reel", ["reelId"])
    .index("by_user_reel", ["userId", "reelId"]),

  reelComments: defineTable({
    reelId: v.id("reels"),
    userId: v.id("users"),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_reel", ["reelId", "createdAt"]),

  stories: defineTable({
    authorId: v.id("users"),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    caption: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_expires", ["expiresAt"]),

  groups: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user_group", ["userId", "groupId"]),

  events: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    virtualLink: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_starts", ["startsAt"]),

  eventRsvps: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(v.literal("going"), v.literal("interested")),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user_event", ["userId", "eventId"]),

  blocks: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    createdAt: v.number(),
  }).index("by_blocker", ["blockerId"]),

  reports: defineTable({
    reporterId: v.id("users"),
    targetUserId: v.optional(v.id("users")),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    reason: v.string(),
    status: v.union(v.literal("pending"), v.literal("reviewed")),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    adminNote: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_status", ["status", "createdAt"]),

  appSettings: defineTable({
    key: v.literal("global"),
    communityRules: v.string(),
    announcementBanner: v.optional(v.string()),
    features: v.object({
      marketplace: v.boolean(),
      jobs: v.boolean(),
      events: v.boolean(),
      groups: v.boolean(),
      reels: v.boolean(),
      voiceRooms: v.boolean(),
    }),
    updatedAt: v.number(),
    updatedBy: v.optional(v.id("users")),
  }).index("by_key", ["key"]),

  listings: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    priceLabel: v.optional(v.string()),
    contactHint: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),

  jobs: defineTable({
    authorId: v.id("users"),
    title: v.string(),
    company: v.optional(v.string()),
    location: v.optional(v.string()),
    description: v.string(),
    applyUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
