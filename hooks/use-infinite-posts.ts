"use client";

import {
  useInfiniteQuery,
  type InfiniteData,
  type UseInfiniteQueryResult,
} from "@tanstack/react-query";
import {
  fetchPostsPage,
  type FeedTab,
  type PostsPageResponse,
} from "@/lib/posts-api";

export type UseInfinitePostsOptions = {
  tab?: FeedTab;
  topic?: string;
  pageSize?: number;
  enabled?: boolean;
};

export type InfinitePostsResult = UseInfiniteQueryResult<
  InfiniteData<PostsPageResponse>,
  Error
>;

/**
 * TanStack Query v5 infinite query for the social feed.
 * Pages are loaded via GET /api/posts?cursor=…
 */
export function useInfinitePosts({
  tab = "everyone",
  topic,
  pageSize = 15,
  enabled = true,
}: UseInfinitePostsOptions = {}): InfinitePostsResult {
  const normalizedTopic = topic && topic !== "All" ? topic : undefined;

  return useInfiniteQuery({
    queryKey: ["posts", "infinite", tab, normalizedTopic ?? "all", pageSize],
    queryFn: ({ pageParam }) =>
      fetchPostsPage({
        cursor: pageParam,
        tab,
        topic: normalizedTopic,
        pageSize,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled,
    staleTime: 30_000,
  });
}

/** Flatten all loaded pages into a single post list */
export function flattenPostsPages(
  data: InfiniteData<PostsPageResponse> | undefined,
): PostsPageResponse["posts"] {
  if (!data) return [];
  return data.pages.flatMap((page) => page.posts);
}
