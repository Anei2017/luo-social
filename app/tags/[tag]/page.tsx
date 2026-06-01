"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { PostCard } from "@/components/luo/post-card";
import type { FeedPost } from "@/lib/types";

export default function TagFeedPage() {
  const params = useParams();
  const tag = typeof params.tag === "string" ? params.tag : "";
  const me = useQuery(api.users.current);
  const posts = useQuery(api.posts.byHashtag, { tag });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CommunityPageHeader
          title={`#${tag}`}
          description="Posts tagged with this hashtag."
        />
        {(posts as FeedPost[] | undefined)?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={me?._id} />
        ))}
        {posts?.length === 0 && (
          <div className="card-dark p-8 text-center text-sm text-on-surface-muted">
            No posts with #{tag} yet.
          </div>
        )}
      </div>
    </AppShell>
  );
}
