"use client";

import {
  useInfiniteQuery,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  fetchProfilePostsPage,
  type ProfilePostsPageResponse,
} from "@/lib/profile-posts-api";
import type { FeedPost } from "@/lib/types";

export function useInfiniteProfilePosts(
  userId: string | undefined,
  pageSize = 12,
) {
  return useInfiniteQuery({
    queryKey: ["profile-posts", userId, pageSize],
    queryFn: ({ pageParam }) =>
      fetchProfilePostsPage({
        userId: userId!,
        cursor: pageParam,
        pageSize,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) =>
      last.hasMore && last.nextCursor ? last.nextCursor : undefined,
    enabled: Boolean(userId),
    staleTime: 30_000,
  });
}

export function flattenProfilePosts(
  data: InfiniteData<ProfilePostsPageResponse> | undefined,
): FeedPost[] {
  if (!data) return [];
  return data.pages.flatMap((p) => p.posts);
}
