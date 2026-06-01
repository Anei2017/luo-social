import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FeedTab } from "@/lib/posts-api";

const VALID_TABS = new Set<FeedTab>(["everyone", "friends", "following"]);

export async function GET(req: Request) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token =
    (await getToken({ template: "convex" })) ?? (await getToken()) ?? undefined;

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const authorId = searchParams.get("authorId");
  const tabParam = searchParams.get("tab") ?? "everyone";
  const topic = searchParams.get("topic") ?? undefined;
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 15, 1),
    30,
  );

  const tab = VALID_TABS.has(tabParam as FeedTab)
    ? (tabParam as FeedTab)
    : "everyone";

  try {
    const result = authorId
      ? await fetchQuery(
          api.posts.byAuthorPaginated,
          {
            userId: authorId as Id<"users">,
            paginationOpts: { numItems: limit, cursor: cursor || null },
          },
          { token },
        )
      : await fetchQuery(
          api.posts.feedPaginated,
          {
            paginationOpts: { numItems: limit, cursor: cursor || null },
            tab,
            topic: topic && topic !== "All" ? topic : undefined,
          },
          { token },
        );

    return NextResponse.json({
      posts: result.page,
      nextCursor: result.isDone ? null : result.continueCursor,
      hasMore: !result.isDone,
    });
  } catch (err) {
    console.error("[api/posts]", err);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 },
    );
  }
}
