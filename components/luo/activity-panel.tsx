"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { Icon } from "./icon";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function ActivityPanel() {
  const items = useQuery(api.notifications.list, { limit: 8 });
  const markRead = useMutation(api.notifications.markRead);

  return (
    <aside className="hidden w-[300px] shrink-0 xl:block">
      <div className="card-dark p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-body text-sm font-bold text-on-surface">
            Recent Activity
          </h3>
          <Link
            href="/notifications"
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>

        {items === undefined && (
          <p className="text-sm text-on-surface-muted">Loading…</p>
        )}

        {items?.length === 0 && (
          <p className="text-sm text-on-surface-muted">
            Likes, comments, and follows will show up here.
          </p>
        )}

        <ul className="space-y-4">
          {items?.map((item) => (
            <li
              key={item._id}
              className={`flex items-start gap-3 ${item.read ? "opacity-70" : ""}`}
            >
              <Link
                href={
                  item.actor?.username
                    ? `/profile/${item.actor.username}`
                    : "/profile"
                }
                className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-surface-elevated"
              >
                <Image
                  src={avatarUrl(item.actor)}
                  alt=""
                  fill
                  unoptimized
                  sizes="40px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-on-surface">
                  <span className="font-semibold">
                    {item.actor?.displayName ?? "Someone"}
                  </span>{" "}
                  <span className="text-on-surface-muted">{item.message}</span>
                </p>
                <span className="text-xs text-on-surface-dim">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
              {!item.read && (
                <button
                  type="button"
                  onClick={() =>
                    markRead({ notificationId: item._id as Id<"notifications"> })
                  }
                  className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary"
                >
                  New
                </button>
              )}
            </li>
          ))}
        </ul>

        <Link
          href="/notifications"
          className="font-body mt-4 flex w-full items-center justify-center gap-1 text-sm text-on-surface-muted hover:text-primary"
        >
          View all
          <Icon name="arrow_forward" className="text-base" />
        </Link>
      </div>
    </aside>
  );
}
