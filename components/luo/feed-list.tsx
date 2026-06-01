"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FeedPost } from "@/lib/types";
import { StoriesRow } from "./stories-row";
import { ComposeBox } from "./compose-box";
import { FeedScrollEffects } from "./feed-scroll-effects";
import { PostCard } from "./post-card";

type FeedMode = "following" | "all";

export function FeedList() {
  const [mode, setMode] = useState<FeedMode>("following");
  const me = useQuery(api.users.current);
  const allPosts = useQuery(api.posts.feed, { limit: 40 });
  const followingPosts = useQuery(api.posts.feedFollowing, { limit: 40 });

  const posts = mode === "following" ? followingPosts : allPosts;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <FeedScrollEffects />
      <StoriesRow />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("following")}
          className={`min-h-11 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold sm:flex-none ${
            mode === "following"
              ? "bg-primary text-on-primary"
              : "bg-surface-elevated text-on-surface-muted"
          }`}
        >
          Following
        </button>
        <button
          type="button"
          onClick={() => setMode("all")}
          className={`min-h-11 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold sm:flex-none ${
            mode === "all"
              ? "bg-primary text-on-primary"
              : "bg-surface-elevated text-on-surface-muted"
          }`}
        >
          Everyone
        </button>
      </div>

      <ComposeBox />

      {posts === undefined && (
        <p className="py-12 text-center text-sm text-on-surface-muted">Loading feed…</p>
      )}

      {posts?.length === 0 && (
        <div className="card-dark p-8 text-center sm:p-12">
          <p className="text-lg font-bold text-on-surface">
            {mode === "following" ? "Follow creators to fill your feed" : "Start the conversation"}
          </p>
          <p className="mt-2 text-sm text-on-surface-muted">
            {mode === "following"
              ? "Explore Discover to find people, or post something for everyone to see."
              : "Share your first post with the LUO SOCIAL community."}
          </p>
        </div>
      )}

      {(posts as FeedPost[] | undefined)?.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={me?._id}
        />
      ))}
    </div>
  );
}
