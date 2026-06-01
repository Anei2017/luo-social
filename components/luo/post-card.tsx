"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { FeedPost } from "@/lib/types";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";
import { CommentThread } from "./comment-thread";
import { Icon } from "./icon";

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr`;
  return `${Math.floor(hrs / 24)} d`;
}

export function PostCard({
  post,
  currentUserId,
}: {
  post: FeedPost;
  currentUserId?: string;
}) {
  const toggleLike = useMutation(api.likes.toggle);
  const removePost = useMutation(api.posts.remove);
  const [liking, setLiking] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAuthor = currentUserId && post.author?._id === currentUserId;
  const profileHref = post.author?.username
    ? `/profile/${post.author.username}`
    : "/profile";
  const postId = post._id as Id<"posts">;

  async function onLike() {
    setLiking(true);
    setActionError(null);
    try {
      await toggleLike({ postId });
    } catch (err) {
      setActionError(formatConvexError(err));
    } finally {
      setLiking(false);
    }
  }

  async function onDelete() {
    if (!confirm("Delete this post?")) return;
    setMenuOpen(false);
    setActionError(null);
    try {
      await removePost({ postId });
    } catch (err) {
      setActionError(formatConvexError(err));
    }
  }

  async function onShare() {
    const url = `${window.location.origin}/feed#post-${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "LUO SOCIAL",
          text: post.content.slice(0, 120),
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setShareMsg("Link copied");
        setTimeout(() => setShareMsg(null), 2000);
      }
    } catch {
      /* cancelled */
    }
  }

  function onCommentClick() {
    setCommentsOpen(true);
    document.getElementById(`comment-focus-${postId}`)?.click();
  }

  return (
    <article id={`post-${post._id}`} className="card-dark overflow-hidden">
      <div className="flex items-start justify-between gap-2 p-4 pb-3 sm:gap-3 sm:p-5">
        <Link href={profileHref} className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full bg-surface-elevated">
            <Image
              src={avatarUrl(post.author)}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="44px"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">
              {post.author?.displayName ?? "Creator"}
            </p>
            <p className="text-xs text-on-surface-dim">
              @{post.author?.username ?? "member"} · {timeAgo(post.createdAt)} ago
              {post.topic ? ` · ${post.topic}` : ""}
            </p>
          </div>
        </Link>
        <div className="relative">
          <button
            type="button"
            aria-label="More options"
            onClick={() => setMenuOpen((v) => !v)}
            className="text-on-surface-muted hover:text-on-surface"
          >
            <Icon name="more_horiz" />
          </button>
          {menuOpen && (
            <div className="absolute top-8 right-0 z-20 min-w-[140px] rounded-xl border border-outline bg-surface py-1 shadow-xl">
              {isAuthor && (
                <button
                  type="button"
                  onClick={onDelete}
                  className="block w-full px-4 py-2 text-left text-sm text-error hover:bg-surface-elevated"
                >
                  Delete post
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onShare();
                }}
                className="block w-full px-4 py-2 text-left text-sm text-on-surface hover:bg-surface-elevated"
              >
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {post.content.trim() && post.content.trim() !== " " && (
        <div className="px-4 pb-4 sm:px-5">
          <p className="font-body text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
            {post.content}
          </p>
        </div>
      )}

      {post.imageUrl && (
        <div className="relative mx-4 mb-4 aspect-[4/3] max-h-[min(70vh,420px)] overflow-hidden rounded-2xl bg-surface-elevated sm:mx-5 sm:aspect-video">
          <Image
            src={post.imageUrl}
            alt="Post attachment"
            fill
            className="object-cover"
            unoptimized
            sizes="(max-width: 768px) 100vw, 640px"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3 sm:gap-4 sm:px-5">
        <button
          type="button"
          onClick={onLike}
          disabled={liking}
          className={`flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold transition-colors active:bg-surface-elevated/50 ${
            post.likedByMe ? "text-primary" : "text-on-surface-muted hover:text-primary"
          }`}
        >
          <Icon name="favorite" filled={post.likedByMe} className="text-xl" />
          {post.likeCount > 0 ? (
            <span>{post.likeCount}</span>
          ) : (
            <span>Like</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCommentClick}
          className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-on-surface-muted transition-colors hover:text-on-surface active:bg-surface-elevated/50"
        >
          <Icon name="chat_bubble" className="text-xl" />
          {post.commentCount > 0 ? (
            <span>{post.commentCount}</span>
          ) : (
            <span>Comment</span>
          )}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-semibold text-on-surface-muted transition-colors hover:text-on-surface active:bg-surface-elevated/50"
        >
          <Icon name="share" className="text-xl" />
          Share
        </button>
        {shareMsg && <span className="text-xs text-primary">{shareMsg}</span>}
        {actionError && (
          <span className="w-full text-xs text-error" role="alert">
            {actionError}
          </span>
        )}
        {!isAuthor && post.author?.username && (
          <Link
            href={`/messages?with=${post.author.username}`}
            className="flex min-h-11 w-full items-center justify-center gap-1 rounded-lg px-2 py-2 text-sm font-semibold text-primary hover:underline active:bg-primary/10 sm:ml-auto sm:w-auto sm:justify-end"
          >
            <Icon name="send" className="text-lg" />
            Message
          </Link>
        )}
      </div>

      <CommentThread
        postId={postId}
        currentUserId={currentUserId}
        expanded={commentsOpen || (post.commentCount ?? 0) > 0}
        onToggleExpand={() => setCommentsOpen((v) => !v)}
      />
    </article>
  );
}
