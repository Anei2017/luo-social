"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QueryBoundary } from "./query-boundary";

function UnreadDot() {
  const unread = useQuery(api.notifications.unreadCount);
  if ((unread ?? 0) <= 0) return null;
  return <span className="absolute -top-0.5 right-0 h-2 w-2 rounded-full bg-primary" />;
}

function UnreadCount({ max = 9 }: { max?: number }) {
  const unread = useQuery(api.notifications.unreadCount);
  if ((unread ?? 0) <= 0) return null;
  return (
    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
      {unread! > max ? `${max}+` : unread}
    </span>
  );
}

export function NotificationUnreadDot() {
  return (
    <QueryBoundary>
      <UnreadDot />
    </QueryBoundary>
  );
}

export function NotificationUnreadCount() {
  return (
    <QueryBoundary>
      <UnreadCount />
    </QueryBoundary>
  );
}
