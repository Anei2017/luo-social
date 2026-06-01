"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/luo/app-shell";
import { CommunityPageHeader } from "@/components/luo/community-page-header";
import { PostCard } from "@/components/luo/post-card";
import { formatConvexError } from "@/lib/convex-errors";
import type { FeedPost } from "@/lib/types";

export default function GroupDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const group = useQuery(api.groups.getBySlug, { slug });
  const me = useQuery(api.users.current);
  const posts = useQuery(
    api.groups.feed,
    group ? { groupId: group._id as Id<"groups"> } : "skip",
  );
  const createPost = useMutation(api.posts.create);
  const join = useMutation(api.groups.join);

  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!group || !content.trim() || posting) return;
    setPosting(true);
    try {
      await createPost({
        content: content.trim(),
        topic: "Community",
        groupId: group._id as Id<"groups">,
      });
      setContent("");
    } catch (err) {
      alert(formatConvexError(err));
    } finally {
      setPosting(false);
    }
  }

  if (group === undefined) {
    return (
      <AppShell>
        <p className="py-12 text-center text-on-surface-muted">Loading…</p>
      </AppShell>
    );
  }

  if (!group) {
    return (
      <AppShell>
        <p className="py-12 text-center text-on-surface-muted">Group not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <CommunityPageHeader
          title={group.name}
          description={group.description}
        />
        {!group.isMember && (
          <div className="card-dark p-4 text-center">
            <p className="text-sm text-on-surface-muted">Join to post in this group.</p>
            <button
              type="button"
              onClick={() => join({ groupId: group._id as Id<"groups"> })}
              className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
            >
              Join group
            </button>
          </div>
        )}
        {group.isMember && (
          <form onSubmit={handlePost} className="card-dark p-4 sm:p-5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post to this group…"
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-on-surface focus:outline-none"
            />
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-40"
            >
              {posting ? "Posting…" : "Post to group"}
            </button>
          </form>
        )}
        {(posts as FeedPost[] | undefined)?.map((post) => (
          <PostCard key={post._id} post={post} currentUserId={me?._id} />
        ))}
        {posts?.length === 0 && (
          <p className="text-center text-sm text-on-surface-muted">No posts in this group yet.</p>
        )}
      </div>
    </AppShell>
  );
}
