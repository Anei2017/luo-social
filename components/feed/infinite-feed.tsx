"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import type { FeedPost } from "@/lib/types";
import type { FeedTab } from "@/lib/posts-api";
import {
  flattenPostsPages,
  useInfinitePosts,
} from "@/hooks/use-infinite-posts";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { PostCard } from "@/components/luo/post-card";
import { Icon } from "@/components/luo/icon";

export type InfiniteFeedProps = {
  tab: FeedTab;
  topic?: string;
  currentUserId?: string;
  pageSize?: number;
  /** Bump to refetch from page 1 (e.g. after creating a post) */
  refreshKey?: number;
  emptyTitle?: string;
  emptyDescription?: React.ReactNode;
  emptyAction?: React.ReactNode;
};

export function InfiniteFeed({
  tab,
  topic,
  currentUserId,
  pageSize = 15,
  refreshKey = 0,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: InfiniteFeedProps) {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfinitePosts({ tab, topic, pageSize });

  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "240px",
    disabled: !hasNextPage || isFetchingNextPage,
  });

  useEffect(() => {
    if (refreshKey > 0) {
      void queryClient.invalidateQueries({ queryKey: ["posts", "infinite"] });
      void refetch();
    }
  }, [refreshKey, queryClient, refetch]);

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = flattenPostsPages(data);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <Icon name="progress_activity" className="animate-spin text-3xl text-primary" />
        <p className="text-sm text-on-surface-muted">Loading feed…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card-dark space-y-3 p-8 text-center">
        <p className="text-sm text-error">
          {error?.message ?? "Could not load posts."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
        >
          Try again
        </button>
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
          post={post as FeedPost}
          currentUserId={currentUserId}
        />
      ))}

      <div ref={sentinelRef} className="flex min-h-16 flex-col items-center justify-center gap-2 py-4">
        {isFetchingNextPage && (
          <>
            <Icon
              name="progress_activity"
              className="animate-spin text-2xl text-primary"
            />
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
