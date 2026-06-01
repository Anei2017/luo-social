"use client";

import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/luo/app-shell";
import { avatarUrl } from "@/lib/avatar";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function NotificationsContent() {
  const items = useQuery(api.notifications.list, { limit: 50 });
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="card-dark flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Notifications</h1>
          <p className="mt-1 text-sm text-on-surface-muted">
            Likes, comments, and new followers
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAllRead()}
          className="min-h-11 w-full shrink-0 rounded-full border border-outline px-4 py-2.5 text-sm font-semibold text-on-surface-muted hover:text-on-surface sm:w-auto"
        >
          Mark all read
        </button>
      </div>

      {items === undefined && (
        <p className="text-center text-sm text-on-surface-muted">Loading…</p>
      )}

      {items?.length === 0 && (
        <div className="card-dark p-12 text-center text-sm text-on-surface-muted">
          No notifications yet. Interact with posts and people to get updates here.
        </div>
      )}

      <ul className="card-dark divide-y divide-outline-soft">
        {items?.map((item) => (
          <li
            key={item._id}
            className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4 ${item.read ? "" : "bg-primary/5"}`}
          >
            <Link
              href={
                item.actor?.username
                  ? `/profile/${item.actor.username}`
                  : "/profile"
              }
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full"
            >
              <Image
                src={avatarUrl(item.actor)}
                alt=""
                fill
                unoptimized
                sizes="48px"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-on-surface">
                <span className="font-semibold">
                  {item.actor?.displayName ?? "Someone"}
                </span>{" "}
                <span className="text-on-surface-muted">{item.message}</span>
              </p>
              <p className="mt-1 text-xs text-on-surface-dim">
                {timeAgo(item.createdAt)}
              </p>
              {item.postId && (
                <Link
                  href="/feed"
                  className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                >
                  View in feed
                </Link>
              )}
            </div>
            {!item.read && (
              <button
                type="button"
                onClick={() =>
                  markRead({ notificationId: item._id as Id<"notifications"> })
                }
                className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary"
              >
                Mark read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AppShell>
      <NotificationsContent />
    </AppShell>
  );
}
