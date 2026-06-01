"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";
import { Icon } from "./icon";

export type ReelItem = {
  _id: string;
  videoUrl?: string;
  caption?: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  author: {
    _id?: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  } | null;
};

export function ReelSlide({
  reel,
  active,
  currentUserId,
}: {
  reel: ReelItem;
  active: boolean;
  currentUserId?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleLike = useMutation(api.reels.toggleLike);
  const addComment = useMutation(api.reels.addComment);
  const removeReel = useMutation(api.reels.remove);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [liking, setLiking] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(reel.likedByMe);
  const [likeCount, setLikeCount] = useState(reel.likeCount);

  const comments = useQuery(
    api.reels.listComments,
    commentsOpen ? { reelId: reel._id as Id<"reels"> } : "skip",
  );

  const isAuthor = currentUserId && reel.author?._id === currentUserId;

  const play = useCallback(() => {
    const v = videoRef.current;
    if (!v || !reel.videoUrl) return;
    v.muted = muted;
    void v.play().catch(() => {});
  }, [muted, reel.videoUrl]);

  const pause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  useEffect(() => {
    if (active) play();
    else pause();
  }, [active, play, pause]);

  useEffect(() => {
    setLiked(reel.likedByMe);
    setLikeCount(reel.likeCount);
  }, [reel.likedByMe, reel.likeCount]);

  async function onLike() {
    setLiking(true);
    setError(null);
    try {
      const res = await toggleLike({ reelId: reel._id as Id<"reels"> });
      setLiked(res.liked);
      setLikeCount((c) => (res.liked ? c + 1 : Math.max(0, c - 1)));
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setLiking(false);
    }
  }

  async function onComment(e: React.FormEvent) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || postingComment) return;
    setPostingComment(true);
    setError(null);
    try {
      await addComment({ reelId: reel._id as Id<"reels">, content: text });
      setCommentText("");
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setPostingComment(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this reel?")) return;
    try {
      await removeReel({ reelId: reel._id as Id<"reels"> });
      window.location.reload();
    } catch (err) {
      setError(formatConvexError(err));
    }
  }

  if (!reel.videoUrl) {
    return (
      <section className="flex h-[calc(100dvh-8rem)] snap-start items-center justify-center bg-surface-elevated">
        <p className="text-sm text-on-surface-muted">Video unavailable</p>
      </section>
    );
  }

  return (
    <section className="relative h-[calc(100dvh-8rem)] min-h-[480px] w-full shrink-0 snap-start snap-always overflow-hidden rounded-none bg-black sm:rounded-2xl">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        playsInline
        loop
        muted={muted}
        preload={active ? "auto" : "metadata"}
        onClick={() => {
          const v = videoRef.current;
          if (!v) return;
          if (v.paused) void v.play();
          else v.pause();
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5 sm:right-4">
        <button
          type="button"
          disabled={liking}
          onClick={onLike}
          className="pointer-events-auto flex flex-col items-center gap-1 text-on-surface"
        >
          <Icon name="favorite" filled={liked} className="text-3xl text-primary" />
          <span className="text-xs font-bold">{likeCount || ""}</span>
        </button>
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="pointer-events-auto flex flex-col items-center gap-1 text-on-surface"
        >
          <Icon name="chat_bubble" className="text-3xl" />
          <span className="text-xs font-bold">{reel.commentCount || ""}</span>
        </button>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="pointer-events-auto flex flex-col items-center gap-1 text-on-surface"
        >
          <Icon name={muted ? "volume_off" : "volume_up"} className="text-2xl" />
        </button>
        {isAuthor && (
          <button
            type="button"
            onClick={onDelete}
            className="pointer-events-auto text-on-surface-dim"
            aria-label="Delete reel"
          >
            <Icon name="delete" className="text-2xl" />
          </button>
        )}
      </div>

      <div className="absolute right-16 bottom-6 left-4 z-10 sm:right-20">
        {reel.author && (
          <Link
            href={`/profile/${reel.author.username}`}
            className="pointer-events-auto mb-2 flex items-center gap-2"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-primary">
              <Image
                src={avatarUrl(reel.author)}
                alt=""
                fill
                unoptimized
                sizes="40px"
              />
            </div>
            <span className="text-sm font-bold text-on-surface">
              @{reel.author.username}
            </span>
          </Link>
        )}
        {reel.caption && (
          <p className="line-clamp-3 text-sm text-on-surface/90">{reel.caption}</p>
        )}
        {reel.author?.username && !isAuthor && (
          <Link
            href={`/messages?with=${reel.author.username}`}
            className="pointer-events-auto mt-2 inline-block text-xs font-bold text-primary"
          >
            Message creator
          </Link>
        )}
      </div>

      {commentsOpen && (
        <div
          className="absolute inset-x-0 bottom-0 z-20 max-h-[55%] overflow-hidden rounded-t-2xl bg-surface/95 backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-outline-soft px-4 py-3">
            <span className="text-sm font-bold">Comments</span>
            <button type="button" onClick={() => setCommentsOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          <ul className="max-h-40 overflow-y-auto px-4 py-2">
            {comments?.map((c) => (
              <li key={c._id} className="py-2 text-sm">
                <span className="font-semibold">{c.author?.displayName}: </span>
                <span className="text-on-surface-muted">{c.content}</span>
              </li>
            ))}
            {comments?.length === 0 && (
              <li className="py-4 text-center text-xs text-on-surface-dim">
                No comments yet
              </li>
            )}
          </ul>
          <form onSubmit={onComment} className="flex gap-2 border-t border-outline-soft p-3">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment…"
              className="min-h-10 flex-1 rounded-full bg-surface-elevated px-4 text-sm"
            />
            <button
              type="submit"
              disabled={postingComment}
              className="rounded-full bg-primary px-4 text-xs font-bold text-on-primary"
            >
              Post
            </button>
          </form>
        </div>
      )}

      {error && (
        <p className="absolute top-3 left-3 right-3 z-30 rounded-lg bg-error/20 px-3 py-2 text-xs text-error">
          {error}
        </p>
      )}
    </section>
  );
}
