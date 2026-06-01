"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { PostCard } from "@/components/luo/post-card";
import type { FeedPost } from "@/lib/types";

export default function CulturalPage() {
  const me = useQuery(api.users.current);
  const posts = useQuery(api.posts.culturalFeed, { limit: 40 });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CommunityPageHeader
          title="Cultural Corner"
          description="Luo traditions, proverbs, recipes, music, and heritage — share and discover."
        />
        {posts === undefined && (
          <p className="py-12 text-center text-sm text-on-surface-muted">Loading…</p>
        )}
        {posts?.length === 0 && (
          <div className="card-dark p-10 text-center text-sm text-on-surface-muted">
            No cultural posts yet. Use topic Culture or tags like #LuoCulture #DholuoProverbs
            when you post.
          </div>
        )}
        {(posts as FeedPost[] | undefined)?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={me?._id} />
        ))}
      </div>
    </AppShell>
  );
}
