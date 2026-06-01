/** @deprecated Use `@/components/profile/ProfilePage` */
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
import { FriendActionButton } from "./friend-action-button";
import { FriendsGrid } from "./friends-grid";
import { ProfileReels } from "./profile-reels";

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
  const friendStats = useQuery(api.friends.stats, {
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
  const blockUser = useMutation(api.safety.block);
  const reportUser = useMutation(api.safety.report);
  const blocked = useQuery(
    api.safety.isBlocked,
    !isOwnProfile ? { userId: user._id as Id<"users"> } : "skip",
  );

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [skillsText, setSkillsText] = useState((user.skills ?? []).join(", "));
  const [clan, setClan] = useState(user.clan ?? "");
  const [hometown, setHometown] = useState(user.hometown ?? "");
  const [interestsText, setInterestsText] = useState((user.interests ?? []).join(", "));
  const [language, setLanguage] = useState<"english" | "dholuo" | "both">(
    (user.language as "english" | "dholuo" | "both") ?? "both",
  );
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
      const interests = interestsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 12);
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        skills,
        clan: clan.trim(),
        hometown: hometown.trim(),
        interests,
        language,
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
        <div className="px-4 py-5 text-center sm:p-6">
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
              <input
                value={clan}
                onChange={(e) => setClan(e.target.value)}
                placeholder="Clan (e.g. Jokanyamwezi)"
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-on-surface"
              />
              <input
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="Hometown"
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-on-surface"
              />
              <input
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                placeholder="Interests (comma separated)"
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-on-surface"
              />
              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "english" | "dholuo" | "both")
                }
                className="w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2 text-sm text-on-surface"
              >
                <option value="both">English & Dholuo</option>
                <option value="english">English</option>
                <option value="dholuo">Dholuo</option>
              </select>
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
              {(user.clan || user.hometown) && (
                <p className="mt-2 text-xs text-on-surface-dim">
                  {[user.clan, user.hometown].filter(Boolean).join(" · ")}
                </p>
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
          <div className="mt-6 flex justify-center gap-6 sm:gap-10">
            <div>
              <p className="text-xl font-bold">{friendStats?.friends ?? 0}</p>
              <p className="text-xs text-on-surface-dim">Friends</p>
            </div>
            <div>
              <p className="text-xl font-bold">{stats?.followers ?? 0}</p>
              <p className="text-xs text-on-surface-dim">Followers</p>
            </div>
            <div>
              <p className="text-xl font-bold">{stats?.following ?? 0}</p>
              <p className="text-xs text-on-surface-dim">Following</p>
            </div>
          </div>
          <div className="mt-6 flex w-full max-w-sm flex-col items-stretch justify-center gap-2 sm:mx-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {isOwnProfile ? (
              !editing && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="min-h-11 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-on-primary"
                >
                  Edit profile
                </button>
              )
            ) : (
              <>
                <FriendActionButton otherUserId={user._id as Id<"users">} />
                <button
                  type="button"
                  onClick={onFollow}
                  disabled={followLoading}
                  className={`min-h-11 rounded-full px-6 py-2.5 text-sm font-bold ${
                    isFollowing
                      ? "border border-outline bg-surface-elevated text-on-surface"
                      : "border border-outline text-on-surface-muted"
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
                  className="flex min-h-11 items-center justify-center rounded-full border border-primary/50 bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary"
                >
                  Message
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    const reason = prompt("Report this user (reason):");
                    if (!reason?.trim()) return;
                    try {
                      await reportUser({
                        targetUserId: user._id as Id<"users">,
                        reason: reason.trim(),
                      });
                      alert("Report submitted.");
                    } catch (err) {
                      setError(formatConvexError(err));
                    }
                  }}
                  className="min-h-11 rounded-full border border-outline px-4 py-2.5 text-xs font-semibold text-on-surface-dim"
                >
                  Report
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Block this user?")) return;
                    try {
                      await blockUser({ userId: user._id as Id<"users"> });
                      setError(null);
                    } catch (err) {
                      setError(formatConvexError(err));
                    }
                  }}
                  className="min-h-11 rounded-full border border-error/40 px-4 py-2.5 text-xs font-semibold text-error"
                >
                  {blocked ? "Blocked" : "Block"}
                </button>
              </>
            )}
            {isOwnProfile && (
              <Link
                href="/friends"
                className="flex min-h-11 items-center justify-center rounded-full border border-outline px-6 py-2.5 text-sm font-semibold text-on-surface-muted"
              >
                Manage friends
              </Link>
            )}
            <Link
              href="/feeds"
              className="flex min-h-11 items-center justify-center rounded-full border border-outline px-6 py-2.5 text-sm font-semibold text-on-surface-muted"
            >
              Feeds
            </Link>
            <Link
              href="/reels"
              className="flex min-h-11 items-center justify-center rounded-full border border-primary/50 bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary"
            >
              Reels
            </Link>
          </div>
          {error && (
            <p className="mt-4 text-center text-sm text-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>

      <ProfileReels
        userId={user._id as Id<"users">}
        username={user.username}
        isOwnProfile={isOwnProfile}
      />

      <FriendsGrid
        userId={user._id as Id<"users">}
        title={isOwnProfile ? "Your friends" : `${user.displayName}'s friends`}
        emptyMessage={
          isOwnProfile
            ? "Add friends from profiles — they'll appear here for everyone to see."
            : "No friends to show yet."
        }
      />

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
