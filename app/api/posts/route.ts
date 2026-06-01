import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FeedTab } from "@/lib/posts-api";

const VALID_TABS = new Set<FeedTab>(["everyone", "friends", "following"]);

async function convexAuthToken(
  getToken: Awaited<ReturnType<typeof auth>>["getToken"],
) {
  try {
    const convex = await getToken({ template: "convex" });
    if (convex) return convex;
  } catch {
    /* Clerk "convex" JWT template may be missing — fall through */
  }
  try {
    return (await getToken()) ?? undefined;
  } catch {
    return undefined;
  }
}

export async function GET(req: Request) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await convexAuthToken(getToken);

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

  const paginationOpts = {
    numItems: limit,
    cursor: cursor || null,
  };

  try {
    const result = authorId
      ? await fetchQuery(
          api.posts.byAuthorPaginated,
          {
            userId: authorId as Id<"users">,
            paginationOpts,
          },
          { token },
        )
      : await fetchQuery(
          api.posts.feedPaginated,
          {
            paginationOpts,
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
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api/posts]", message);

    // Retry without auth if JWT is misconfigured (feed still works for public data)
    if (token) {
      try {
        const result = authorId
          ? await fetchQuery(api.posts.byAuthorPaginated, {
              userId: authorId as Id<"users">,
              paginationOpts,
            })
          : await fetchQuery(api.posts.feedPaginated, {
              paginationOpts,
              tab,
              topic: topic && topic !== "All" ? topic : undefined,
            });

        return NextResponse.json({
          posts: result.page,
          nextCursor: result.isDone ? null : result.continueCursor,
          hasMore: !result.isDone,
        });
      } catch (retryErr) {
        console.error("[api/posts] retry", retryErr);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to load posts",
        detail:
          process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 },
    );
  }
}
