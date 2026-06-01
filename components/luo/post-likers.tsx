"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PostLikers({
  postId,
  likeCount,
  open,
  onOpenChange,
}: {
  postId: Id<"posts">;
  likeCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const likers = useQuery(api.reactions.listByPost, open ? { postId } : "skip");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[70vh] gap-0 overflow-hidden border border-outline bg-surface p-0 text-on-surface sm:max-w-md"
      >
        <DialogHeader className="border-b border-outline-soft px-4 py-3">
          <DialogTitle className="font-bold text-on-surface">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </DialogTitle>
        </DialogHeader>
        <ul className="max-h-[55vh] overflow-y-auto">
          {likers === undefined && (
            <li className="p-4 text-sm text-on-surface-muted">Loading…</li>
          )}
          {likers?.length === 0 && (
            <li className="p-4 text-sm text-on-surface-muted">No likes yet.</li>
          )}
          {likers?.map((row) =>
            row.user ? (
              <li
                key={row._id}
                className="flex items-center gap-3 border-b border-outline-soft/50 px-4 py-3 last:border-0"
              >
                <Link
                  href={`/profile/${row.user.username}`}
                  className="flex min-w-0 flex-1 items-center gap-3"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={avatarUrl(row.user)}
                      alt=""
                      fill
                      unoptimized
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {row.user.displayName}
                    </p>
                    <p className="text-xs text-on-surface-dim">
                      @{row.user.username}
                      {row.reaction ? ` · ${row.reaction}` : ""}
                    </p>
                  </div>
                </Link>
                <Link
                  href={`/messages?with=${row.user.username}`}
                  className="shrink-0 rounded-full border border-primary/50 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  onClick={() => onOpenChange(false)}
                >
                  Message
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
