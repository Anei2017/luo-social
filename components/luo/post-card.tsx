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
import { PostLikers } from "./post-likers";
import { PostPoll } from "./post-poll";
import { PostReactionsBar } from "./post-reactions-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const reportPost = useMutation(api.safety.report);
  const removePost = useMutation(api.posts.remove);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [likersOpen, setLikersOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isAuthor = currentUserId && post.author?._id === currentUserId;
  const profileHref = post.author?.username
    ? `/profile/${post.author.username}`
    : "/profile";
  const postId = post._id as Id<"posts">;

  async function onReport() {
    const reason = prompt("Why are you reporting this post?");
    if (!reason?.trim()) return;
    try {
      await reportPost({
        postId,
        reason: reason.trim(),
        targetUserId: post.author?._id as Id<"users"> | undefined,
      });
      alert("Report submitted. Thank you.");
    } catch (err) {
      setActionError(formatConvexError(err));
    }
  }

  async function onDelete() {
    if (!confirm("Delete this post?")) return;
    setActionError(null);
    try {
      await removePost({ postId });
    } catch (err) {
      setActionError(formatConvexError(err));
    }
  }

  async function onShare() {
    const url = `${window.location.origin}/feeds#post-${post._id}`;
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
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="More options"
            className="text-on-surface-muted hover:text-on-surface"
          >
            <Icon name="more_horiz" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[140px] rounded-xl border border-outline bg-surface text-on-surface shadow-xl"
          >
            {isAuthor && (
              <DropdownMenuItem
                variant="destructive"
                onClick={onDelete}
                className="text-error focus:bg-surface-elevated focus:text-error"
              >
                Delete post
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onShare}
              className="focus:bg-surface-elevated focus:text-on-surface"
            >
              Share
            </DropdownMenuItem>
            {!isAuthor && (
              <DropdownMenuItem
                variant="destructive"
                onClick={onReport}
                className="text-error focus:bg-surface-elevated focus:text-error"
              >
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {post.content.trim() && post.content.trim() !== " " && (
        <div className="px-4 pb-4 sm:px-5">
          <p className="font-body text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
            {post.content}
          </p>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {post.hashtags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tags/${tag}`}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          {post.language === "dholuo" && (
            <span className="mt-2 inline-block text-[10px] font-medium text-primary">
              Dholuo
            </span>
          )}
        </div>
      )}

      {post.poll && post.poll.options.length >= 2 && (
        <PostPoll postId={postId} poll={post.poll} />
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
        <PostReactionsBar
          postId={postId}
          likeCount={post.likeCount}
          likedByMe={post.likedByMe}
          myReaction={post.myReaction}
          onOpenLikers={() => setLikersOpen(true)}
        />
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

      <PostLikers
        postId={postId}
        likeCount={post.likeCount}
        open={likersOpen}
        onOpenChange={setLikersOpen}
      />
    </article>
  );
}
