"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatConvexError } from "@/lib/convex-errors";
import { Icon } from "./icon";

const REACTIONS = [
  { id: "like", icon: "favorite", label: "Like" },
  { id: "love", icon: "favorite", label: "Love" },
  { id: "laugh", icon: "sentiment_very_satisfied", label: "Laugh" },
  { id: "sad", icon: "sentiment_dissatisfied", label: "Sad" },
  { id: "wow", icon: "auto_awesome", label: "Wow" },
] as const;

export function PostReactionsBar({
  postId,
  likeCount,
  likedByMe,
  myReaction,
  onOpenLikers,
}: {
  postId: Id<"posts">;
  likeCount: number;
  likedByMe: boolean;
  myReaction?: string | null;
  onOpenLikers?: () => void;
}) {
  const setReaction = useMutation(api.reactions.set);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function pick(reaction: (typeof REACTIONS)[number]["id"]) {
    setBusy(true);
    try {
      await setReaction({
        postId,
        reaction,
      });
      setOpen(false);
    } catch (err) {
      alert(formatConvexError(err));
    } finally {
      setBusy(false);
    }
  }

  const active = myReaction ?? (likedByMe ? "like" : null);

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
        className={`flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold ${
          active ? "text-primary" : "text-on-surface-muted hover:text-primary"
        }`}
      >
        <Icon
          name="favorite"
          filled={!!active}
          className="text-xl"
        />
        <span>React</span>
      </button>
      {likeCount > 0 && onOpenLikers && (
        <button
          type="button"
          onClick={onOpenLikers}
          className="min-h-11 text-sm font-semibold text-primary hover:underline"
        >
          {likeCount}
        </button>
      )}
      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-1 flex gap-1 rounded-full border border-outline bg-surface px-2 py-1.5 shadow-xl">
          {REACTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              title={r.label}
              disabled={busy}
              onClick={() => pick(r.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                active === r.id ? "bg-primary/20 text-primary" : "hover:bg-surface-elevated"
              }`}
            >
              <Icon name={r.icon} filled={r.id === "like" || r.id === "love"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
