"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/luo/app-shell";
import type { DiscoverPost } from "@/lib/types";
import { avatarUrl } from "@/lib/avatar";

function DiscoverGrid() {
  const posts = useQuery(api.posts.discover);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="card-dark p-4 sm:p-6">
        <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Explore</h1>
        <p className="mt-1 text-sm text-on-surface-muted">
          Discover creators and stories across LUO SOCIAL.
        </p>
        <Link
          href="/feed"
          className="mt-4 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-bold text-on-primary"
        >
          Back to feed
        </Link>
      </div>

      <div className="columns-1 gap-4 space-y-4 sm:columns-2">
        {(posts as DiscoverPost[] | undefined)?.map((post) => (
          <article key={String(post._id)} className="card-dark break-inside-avoid p-4">
            <Link
              href={
                post.author?.username
                  ? `/profile/${post.author.username}`
                  : "/profile"
              }
              className="mb-3 flex items-center gap-2"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={avatarUrl(post.author)}
                  alt=""
                  fill
                  unoptimized
                  sizes="32px"
                />
              </div>
              <span className="text-sm font-semibold hover:text-primary">
                {post.author?.displayName}
              </span>
            </Link>
            <Link href={`/feed#post-${post._id}`}>
              <p className="line-clamp-4 text-sm text-on-surface-muted">
                {post.content}
              </p>
              {post.imageUrl && (
                <div className="relative mt-3 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="300px"
                  />
                </div>
              )}
            </Link>
            {post.topic && (
              <span className="mt-2 inline-block text-xs font-medium text-primary">
                #{post.topic}
              </span>
            )}
          </article>
        ))}
      </div>

      {posts?.length === 0 && (
        <div className="card-dark p-12 text-center text-sm text-on-surface-muted">
          No posts to explore yet. Be the first to share.
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <AppShell>
      <DiscoverGrid />
    </AppShell>
  );
}
