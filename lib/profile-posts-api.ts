import type { FeedPost } from "@/lib/types";

export type ProfilePostsPageResponse = {
  posts: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export async function fetchProfilePostsPage({
  userId,
  cursor = null,
  pageSize = 12,
}: {
  userId: string;
  cursor?: string | null;
  pageSize?: number;
}): Promise<ProfilePostsPageResponse> {
  const params = new URLSearchParams();
  params.set("authorId", userId);
  params.set("limit", String(pageSize));
  if (cursor) params.set("cursor", cursor);

  const res = await fetch(`/api/posts?${params}`, { credentials: "include" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Failed to load posts (${res.status})`,
    );
  }
  return res.json() as Promise<ProfilePostsPageResponse>;
}
