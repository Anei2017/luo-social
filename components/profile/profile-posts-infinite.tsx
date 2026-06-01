"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  flattenProfilePosts,
  useInfiniteProfilePosts,
} from "@/hooks/use-infinite-profile-posts";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { PostCard } from "@/components/luo/post-card";
import type { FeedPost } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

type ProfilePostsInfiniteProps = {
  userId: string;
  currentUserId?: string;
};

/** User posts tab with TanStack infinite scroll + intersection observer */
export function ProfilePostsInfinite({
  userId,
  currentUserId,
}: ProfilePostsInfiniteProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProfilePosts(userId);

  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "280px",
    disabled: !hasNextPage || isFetchingNextPage,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = flattenProfilePosts(data);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-outline bg-surface p-8 text-center">
        <p className="text-sm text-error">{error?.message ?? "Could not load posts."}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary"
        >
          Try again
        </button>
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
          post={post as FeedPost}
          currentUserId={currentUserId}
        />
      ))}
      <div
        ref={sentinelRef}
        className="flex min-h-14 flex-col items-center justify-center gap-2 py-4"
      >
        {isFetchingNextPage && (
          <>
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs text-on-surface-muted">Loading more posts…</p>
          </>
        )}
        {!hasNextPage && !isFetchingNextPage && (
          <p className="text-xs font-medium text-on-surface-dim">No more posts</p>
        )}
      </div>
    </div>
  );
}
