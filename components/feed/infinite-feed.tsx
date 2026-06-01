"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FeedPost } from "@/lib/types";
import type { FeedTab } from "@/lib/posts-api";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { PostCard } from "@/components/luo/post-card";
import { Icon } from "@/components/luo/icon";

export type InfiniteFeedProps = {
  tab: FeedTab;
  topic?: string;
  currentUserId?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
};

/**
 * Infinite feed via Convex usePaginatedQuery (same Clerk auth as the rest of the app).
 * Avoids /api/posts server fetchQuery issues on Vercel.
 */
export function InfiniteFeed({
  tab,
  topic,
  currentUserId,
  pageSize = 15,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: InfiniteFeedProps) {
  const normalizedTopic = topic && topic !== "All" ? topic : undefined;

  const { results, status, isLoading, loadMore } = usePaginatedQuery(
    api.posts.feedPaginated,
    { tab, topic: normalizedTopic },
    { initialNumItems: pageSize },
  );

  const posts = (results ?? []) as FeedPost[];
  const canLoadMore = status === "CanLoadMore";
  const isFetchingMore = status === "LoadingMore";

  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "240px",
    disabled: !canLoadMore || isFetchingMore,
  });

  useEffect(() => {
    if (isIntersecting && canLoadMore && !isFetchingMore) {
      loadMore(pageSize);
    }
  }, [isIntersecting, canLoadMore, isFetchingMore, loadMore, pageSize]);

  if (status === "LoadingFirstPage" || isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <Icon name="progress_activity" className="animate-spin text-3xl text-primary" />
        <p className="text-sm text-on-surface-muted">Loading feed…</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="card-dark space-y-4 p-8 text-center sm:p-12">
        <Icon name="dynamic_feed" className="mx-auto text-5xl text-on-surface-dim" />
        <p className="text-lg font-bold text-on-surface">
          {emptyTitle ?? defaultEmptyTitle(tab, topic)}
        </p>
        <p className="text-sm text-on-surface-muted">
          {emptyDescription ?? defaultEmptyDescription(tab)}
        </p>
        {emptyAction}
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
        className="flex min-h-16 flex-col items-center justify-center gap-2 py-4"
      >
        {isFetchingMore && (
          <>
            <Icon
              name="progress_activity"
              className="animate-spin text-2xl text-primary"
            />
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

function defaultEmptyTitle(tab: FeedTab, topic?: string) {
  if (tab === "friends") return "No posts from friends yet";
  if (tab === "following") return "Your following feed is empty";
  if (topic && topic !== "All") return `No posts in ${topic}`;
  return "No posts yet";
}

function defaultEmptyDescription(tab: FeedTab) {
  if (tab === "friends") {
    return (
      <>
        Add friends on{" "}
        <Link href="/friends" className="font-semibold text-primary underline">
          Friends
        </Link>{" "}
        — their posts will show here.
      </>
    );
  }
  if (tab === "following") {
    return (
      <>
        Follow creators in{" "}
        <Link href="/discover" className="font-semibold text-primary underline">
          Discover
        </Link>{" "}
        or post something yourself.
      </>
    );
  }
  return "Be the first to share — use the compose box above.";
}
