"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ConvexUser, FeedPost } from "@/lib/types";
import { avatarUrl } from "@/lib/avatar";
import { formatConvexError } from "@/lib/convex-errors";
import { PostCard } from "./post-card";

export function ProfileView({
  user,
  isOwnProfile,
}: {
  user: ConvexUser;
  isOwnProfile: boolean;
}) {
  const me = useQuery(api.users.current);
  const stats = useQuery(api.follows.stats, {
    userId: user._id as Id<"users">,
  });
  const isFollowing = useQuery(api.follows.isFollowing, {
    userId: user._id as Id<"users">,
  });
  const posts = useQuery(api.posts.byAuthor, {
    userId: user._id as Id<"users">,
    limit: 30,
  });
  const toggleFollow = useMutation(api.follows.toggle);
  const updateProfile = useMutation(api.users.updateProfile);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [skillsText, setSkillsText] = useState((user.skills ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFollow() {
    setFollowLoading(true);
    setError(null);
    try {
      await toggleFollow({ followingId: user._id as Id<"users"> });
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setFollowLoading(false);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        skills,
      });
      setEditing(false);
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="card-dark overflow-hidden">
        <div className="profile-arches relative flex h-40 items-end justify-center bg-surface-elevated pt-8">
          <div className="relative z-10 mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-surface">
            <Image
              src={avatarUrl(user)}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="96px"
            />
          </div>
        </div>
        <div className="p-6 text-center">
          {editing ? (
            <form onSubmit={saveProfile} className="space-y-3 text-left">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-on-surface"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Bio"
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-on-surface"
              />
              <input
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                placeholder="Skills (comma separated)"
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-on-surface"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-primary py-2 text-sm font-bold text-on-primary"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-outline px-4 py-2 text-sm text-on-surface-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-on-surface-muted">@{user.username}</p>
              {user.bio && (
                <p className="mt-4 text-sm text-on-surface-muted">{user.bio}</p>
              )}
              {user.skills && user.skills.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {user.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-on-surface-muted"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
          <div className="mt-6 flex justify-center gap-10">
            <div>
              <p className="text-xl font-bold">{stats?.followers ?? 0}</p>
              <p className="text-xs text-on-surface-dim">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold">{stats?.following ?? 0}</p>
              <p className="text-xs text-on-surface-dim">Following</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            {isOwnProfile ? (
              !editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary"
                >
                  Edit profile
                </button>
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={onFollow}
                  disabled={followLoading}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold ${
                    isFollowing
                      ? "border border-outline bg-surface-elevated text-on-surface"
                      : "bg-primary text-on-primary"
                  }`}
                >
                  {followLoading
                    ? "…"
                    : isFollowing
                      ? "Following"
                      : "Follow"}
                </button>
                <Link
                  href={`/messages?with=${user.username}`}
                  className="rounded-full border border-primary/50 bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary"
                >
                  Message
                </Link>
              </>
            )}
            <Link
              href="/feed"
              className="rounded-full border border-outline px-6 py-2.5 text-sm font-semibold text-on-surface-muted"
            >
              Feed
            </Link>
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <h2 className="px-1 text-lg font-bold text-on-surface">Posts</h2>
      {posts === undefined && (
        <p className="text-center text-sm text-on-surface-muted">Loading posts…</p>
      )}
      {posts?.length === 0 && (
        <div className="card-dark p-8 text-center text-sm text-on-surface-muted">
          {isOwnProfile
            ? "You haven't posted yet. Share something from the feed."
            : "No posts yet."}
        </div>
      )}
      {(posts as FeedPost[] | undefined)?.map((post) => (
        <PostCard key={post._id} post={post} currentUserId={me?._id} />
      ))}
    </div>
  );
}
