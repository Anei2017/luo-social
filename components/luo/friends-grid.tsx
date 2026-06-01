"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { Icon } from "./icon";

export function FriendsGrid({
  userId,
  title = "Friends",
  emptyMessage = "No friends to show yet.",
  limit = 24,
}: {
  userId: Id<"users">;
  title?: string;
  emptyMessage?: string;
  limit?: number;
}) {
  const friends = useQuery(api.friends.listForUser, { userId, limit });

  return (
    <section className="card-dark p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-on-surface">{title}</h2>
        {friends && friends.length > 0 && (
          <span className="text-sm text-on-surface-muted">
            {friends.length} {friends.length === 1 ? "friend" : "friends"}
          </span>
        )}
      </div>

      {friends === undefined && (
        <p className="text-sm text-on-surface-muted">Loading friends…</p>
      )}

      {friends?.length === 0 && (
        <p className="text-center text-sm text-on-surface-muted py-6">{emptyMessage}</p>
      )}

      {friends && friends.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {friends.map((entry) => (
              <li key={entry.friendshipId}>
                <Link
                  href={`/profile/${entry.user.username}`}
                  className="flex flex-col items-center rounded-xl border border-outline-soft bg-surface-elevated/50 p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="relative mb-2 h-16 w-16 overflow-hidden rounded-full">
                    <Image
                      src={avatarUrl(entry.user)}
                      alt=""
                      fill
                      unoptimized
                      sizes="64px"
                    />
                  </div>
                  <p className="line-clamp-1 w-full text-sm font-semibold text-on-surface">
                    {entry.user.displayName}
                  </p>
                  <p className="line-clamp-1 w-full text-xs text-on-surface-dim">
                    @{entry.user.username}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                    <Icon name="group" className="text-sm" />
                    Friend
                  </span>
                </Link>
              </li>
          ))}
        </ul>
      )}
    </section>
  );
}
