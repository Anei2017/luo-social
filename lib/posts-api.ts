import type { FeedPost } from "@/lib/types";

export type FeedTab = "everyone" | "friends" | "following";

export type PostsPageResponse = {
  posts: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type FetchPostsPageParams = {
  cursor?: string | null;
  tab?: FeedTab;
  topic?: string;
  pageSize?: number;
};

/** Fetch one page of posts from the Next.js API route */
export async function fetchPostsPage({
  cursor = null,
  tab = "everyone",
  topic,
  pageSize = 15,
}: FetchPostsPageParams): Promise<PostsPageResponse> {
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("limit", String(pageSize));
  if (cursor) params.set("cursor", cursor);
  if (topic && topic !== "All") params.set("topic", topic);

  const res = await fetch(`/api/posts?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Failed to load posts (${res.status})`,
    );
  }

  return res.json() as Promise<PostsPageResponse>;
}
