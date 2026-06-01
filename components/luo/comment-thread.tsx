"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

type CommentThreadProps = {
  postId: Id<"posts">;
  currentUserId?: string;
  expanded: boolean;
  onToggleExpand: () => void;
};

export function CommentThread({
  postId,
  currentUserId,
  expanded,
  onToggleExpand,
}: CommentThreadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const comments = useQuery(api.comments.listByPost, { postId });
  const addComment = useMutation(api.comments.add);
  const removeComment = useMutation(api.comments.remove);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("comment") as HTMLInputElement;
    const text = input.value.trim();
    if (!text || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await addComment({ postId, content: text });
      input.value = "";
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(commentId: Id<"comments">) {
    setError(null);
    try {
      await removeComment({ commentId });
    } catch (err) {
      setError(formatConvexError(err));
    }
  }

  function focusInput() {
    onToggleExpand();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  const shown = expanded ? comments : comments?.slice(-2);

  return (
    <div className="border-t border-outline-soft">
      {(comments?.length ?? 0) > 2 && !expanded && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="min-h-11 w-full px-4 py-3 text-left text-xs font-semibold text-primary hover:bg-surface-elevated/50 sm:px-5"
        >
          View all {comments?.length} comments
        </button>
      )}

      {shown && shown.length > 0 && (
        <ul className="space-y-3 px-4 py-3 sm:px-5">
          {shown.map((c) => (
            <li key={c._id} className="flex gap-2">
              <Link
                href={
                  c.author?.username
                    ? `/profile/${c.author.username}`
                    : "/profile"
                }
                className="relative mt-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-surface-elevated"
              >
                <Image
                  src={avatarUrl(c.author)}
                  alt=""
                  fill
                  unoptimized
                  sizes="32px"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="inline-block max-w-full rounded-2xl rounded-tl-sm bg-surface-elevated px-3 py-2">
                  <p className="text-xs font-semibold text-on-surface">
                    {c.author?.displayName ?? "Member"}
                    <span className="ml-2 font-normal text-on-surface-dim">
                      {timeAgo(c.createdAt)}
                    </span>
                  </p>
                  <p className="text-sm text-on-surface-muted whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {currentUserId !== c.userId && c.author?.username && (
                    <Link
                      href={`/messages?with=${c.author.username}`}
                      className="text-[10px] font-medium text-primary hover:underline"
                    >
                      Message
                    </Link>
                  )}
                  {currentUserId === c.userId && (
                    <button
                      type="button"
                      onClick={() => onDelete(c._id as Id<"comments">)}
                      className="text-[10px] font-medium text-on-surface-dim hover:text-error"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="flex items-center gap-2 px-4 py-3 sm:px-5">
        <input
          ref={inputRef}
          name="comment"
          placeholder="Write a comment…"
          className="font-body min-h-11 flex-1 rounded-full bg-surface-elevated px-4 py-2.5 text-base text-on-surface placeholder:text-on-surface-dim focus:outline-none focus:ring-2 focus:ring-primary/40 sm:text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="min-h-11 shrink-0 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-on-primary disabled:opacity-50"
        >
          {submitting ? "…" : "Post"}
        </button>
      </form>
      {error && (
        <p className="px-5 pb-2 text-xs text-error" role="alert">
          {error}
        </p>
      )}

      {/* Expose focus for parent comment icon */}
      <button
        type="button"
        id={`comment-focus-${postId}`}
        className="sr-only"
        onClick={focusInput}
        tabIndex={-1}
      >
        focus
      </button>
    </div>
  );
}
