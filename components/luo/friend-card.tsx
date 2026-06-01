"use client";

import Image from "next/image";
import Link from "next/link";
import { avatarUrl } from "@/lib/avatar";
export function FriendCard({
  user,
  actions,
}: {
  user: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  actions?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-outline-soft bg-surface-elevated/40 p-3">
      <Link
        href={`/profile/${user.username}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          <Image
            src={avatarUrl(user)}
            alt=""
            fill
            unoptimized
            sizes="48px"
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-on-surface">
            {user.displayName}
          </p>
          <p className="truncate text-xs text-on-surface-dim">@{user.username}</p>
        </div>
      </Link>
      {actions && <div className="flex shrink-0 flex-col gap-1 sm:flex-row">{actions}</div>}
    </li>
  );
}
