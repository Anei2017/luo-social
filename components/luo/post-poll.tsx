"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatConvexError } from "@/lib/convex-errors";

type PollData = {
  options: string[];
  counts: number[];
  total: number;
  myVote?: number;
  pollEndsAt?: number;
};

export function PostPoll({
  postId,
  poll,
}: {
  postId: Id<"posts">;
  poll: PollData;
}) {
  const vote = useMutation(api.polls.vote);

  async function onVote(index: number) {
    try {
      await vote({ postId, optionIndex: index });
    } catch (err) {
      alert(formatConvexError(err));
    }
  }

  const ended = poll.pollEndsAt ? Date.now() > poll.pollEndsAt : false;

  return (
    <div className="mx-4 mb-4 space-y-2 rounded-xl bg-surface-elevated p-4 sm:mx-5">
      <p className="text-xs font-bold text-primary">Poll</p>
      {poll.options.map((option, i) => {
        const count = poll.counts[i] ?? 0;
        const pct = poll.total > 0 ? Math.round((count / poll.total) * 100) : 0;
        const selected = poll.myVote === i;
        return (
          <button
            key={option}
            type="button"
            disabled={ended && poll.myVote === undefined}
            onClick={() => onVote(i)}
            className={`relative w-full overflow-hidden rounded-lg border px-3 py-2.5 text-left text-sm ${
              selected
                ? "border-primary bg-primary/10"
                : "border-outline-soft hover:border-primary/40"
            }`}
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/15"
              style={{ width: `${pct}%` }}
            />
            <span className="relative flex justify-between gap-2">
              <span className="font-medium text-on-surface">{option}</span>
              <span className="text-xs text-on-surface-dim">{pct}%</span>
            </span>
          </button>
        );
      })}
      <p className="text-[10px] text-on-surface-dim">
        {poll.total} vote{poll.total === 1 ? "" : "s"}
        {ended ? " · ended" : ""}
      </p>
    </div>
  );
}
