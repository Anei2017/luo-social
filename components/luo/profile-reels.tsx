"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Icon } from "./icon";

export function ProfileReels({
  userId,
  username,
  isOwnProfile,
}: {
  userId: Id<"users">;
  username: string;
  isOwnProfile: boolean;
}) {
  const reels = useQuery(api.reels.byAuthor, { userId, limit: 6 });

  return (
    <section className="card-dark p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-on-surface">Reels</h2>
        <Link href="/reels" className="text-xs font-semibold text-primary">
          Watch all →
        </Link>
      </div>
      {reels === undefined && (
        <p className="text-sm text-on-surface-muted">Loading…</p>
      )}
      {reels?.length === 0 && (
        <p className="text-center text-sm text-on-surface-muted py-4">
          {isOwnProfile
            ? "You haven't posted a reel yet."
            : "No reels yet."}
          {isOwnProfile && (
            <Link href="/reels" className="mt-2 block font-bold text-primary">
              Create your first reel
            </Link>
          )}
        </p>
      )}
      {reels && reels.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {reels
            .flatMap((reel) => (reel?.videoUrl ? [reel] : []))
            .map((reel) => (
              <Link
                key={reel._id}
                href="/reels"
                className="relative aspect-[9/16] overflow-hidden rounded-lg bg-black"
              >
                <video
                  src={reel.videoUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-1 left-1 flex items-center gap-0.5 text-[10px] font-bold text-white drop-shadow">
                  <Icon name="play_arrow" className="text-sm" />
                  {reel.likeCount > 0 ? reel.likeCount : ""}
                </span>
              </Link>
            ))}
        </div>
      )}
      {!isOwnProfile && reels && reels.length > 0 && (
        <Link
          href={`/reels`}
          className="mt-3 block text-center text-xs text-on-surface-muted"
        >
          See @{username}&apos;s videos in Reels
        </Link>
      )}
    </section>
  );
}
