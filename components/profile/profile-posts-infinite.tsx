"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { PostCard } from "@/components/luo/post-card";
import type { FeedPost } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type ProfilePostsInfiniteProps = {
  userId: string;
  currentUserId?: string;
};

/** Profile posts tab — Convex pagination (reliable Clerk auth on client) */
export function ProfilePostsInfinite({
  userId,
  currentUserId,
}: ProfilePostsInfiniteProps) {
  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.posts.byAuthorPaginated,
    { userId: userId as Id<"users"> },
    { initialNumItems: 12 },
  );

  const posts = (results ?? []) as FeedPost[];
  const canLoadMore = status === "CanLoadMore";
  const isFetchingMore = status === "LoadingMore";

  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "280px",
    disabled: !canLoadMore || isFetchingMore,
  });

  useEffect(() => {
    if (isIntersecting && canLoadMore && !isFetchingMore) {
      loadMore(12);
    }
  }, [isIntersecting, canLoadMore, isFetchingMore, loadMore]);

  if (status === "LoadingFirstPage" || isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-900/20 bg-surface/80 p-10 text-center text-sm text-on-surface-muted">
        No posts yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
        />
      ))}
      <div
        ref={sentinelRef}
        className="flex min-h-14 flex-col items-center justify-center gap-2 py-4"
      >
        {isFetchingMore && (
          <>
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs text-on-surface-muted">Loading more posts…</p>
          </>
        )}
        {status === "Exhausted" && !isFetchingMore && (
          <p className="text-xs font-medium text-on-surface-dim">No more posts</p>
        )}
      </div>
    </div>
  );
}
