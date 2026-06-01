"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatConvexError } from "@/lib/convex-errors";

export function FriendActionButton({
  otherUserId,
  compact,
}: {
  otherUserId: Id<"users">;
  compact?: boolean;
}) {
  const status = useQuery(api.friends.statusWith, { otherUserId });
  const sendRequest = useMutation(api.friends.sendRequest);
  const acceptRequest = useMutation(api.friends.acceptRequest);
  const removeFriend = useMutation(api.friends.removeFriend);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pendingIncoming = useQuery(api.friends.listPendingIncoming);
  const incomingRow = pendingIncoming?.find((r) => r.user._id === otherUserId);

  async function run(action: () => Promise<unknown>) {
    setLoading(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setLoading(false);
    }
  }

  if (status === undefined) {
    return (
      <span className="text-xs text-on-surface-dim">…</span>
    );
  }

  const btn =
    "min-h-11 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50";
  const compactBtn = "rounded-full px-3 py-1.5 text-xs font-bold disabled:opacity-50";
  const cls = compact ? compactBtn : btn;

  let control: React.ReactNode = null;

  switch (status.status) {
    case "friends":
      control = (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => removeFriend({ otherUserId }))}
          className={`${cls} border border-outline bg-surface-elevated text-on-surface`}
        >
          {loading ? "…" : "Friends ✓"}
        </button>
      );
      break;
    case "pending_out":
      control = (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => removeFriend({ otherUserId }))}
          className={`${cls} border border-outline text-on-surface-muted`}
        >
          {loading ? "…" : "Request sent"}
        </button>
      );
      break;
    case "pending_in":
      control = (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || !incomingRow}
            onClick={() =>
              incomingRow &&
              run(() => acceptRequest({ friendshipId: incomingRow.friendshipId }))
            }
            className={`${cls} bg-primary text-on-primary`}
          >
            {loading ? "…" : "Accept"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => run(() => removeFriend({ otherUserId }))}
            className={`${cls} border border-outline text-on-surface-muted`}
          >
            Decline
          </button>
        </div>
      );
      break;
    default:
      control = (
        <button
          type="button"
          disabled={loading}
          onClick={() => run(() => sendRequest({ otherUserId }))}
          className={`${cls} border border-primary/50 bg-primary/10 text-primary`}
        >
          {loading ? "…" : "Add friend"}
        </button>
      );
  }

  return (
    <div className="flex flex-col items-stretch gap-1">
      {control}
      {error && (
        <p className="text-center text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
