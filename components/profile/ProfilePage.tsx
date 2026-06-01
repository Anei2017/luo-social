"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  Calendar,
  Camera,
  ImageIcon,
  Loader2,
  MapPin,
  Pencil,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { coverImageSrc } from "@/lib/cover";
import { formatConvexError } from "@/lib/convex-errors";
import type { ConvexUser, FeedPost } from "@/lib/types";
import { uploadImageToConvex } from "@/lib/upload-image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/luo/post-card";
import { FriendActionButton } from "@/components/luo/friend-action-button";
import { ProfileReels } from "@/components/luo/profile-reels";

type ProfileTab = "posts" | "about" | "photos" | "events";

const TABS: { id: ProfileTab; label: string; icon: typeof ImageIcon }[] = [
  { id: "posts", label: "Posts", icon: ImageIcon },
  { id: "about", label: "About", icon: Users },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "events", label: "Events", icon: Calendar },
];

export type ProfilePageProps = {
  user: ConvexUser;
  isOwnProfile: boolean;
};

export function ProfilePage({ user, isOwnProfile }: ProfilePageProps) {
  const me = useQuery(api.users.current);
  const stats = useQuery(api.follows.stats, {
    userId: user._id as Id<"users">,
  });
  const isFollowing = useQuery(api.follows.isFollowing, {
    userId: user._id as Id<"users">,
  });
  const posts = useQuery(api.posts.byAuthor, {
    userId: user._id as Id<"users">,
    limit: 40,
  });
  const userEvents = useQuery(api.events.byAuthor, {
    userId: user._id as Id<"users">,
  });

  const updateProfile = useMutation(api.users.updateProfile);
  const toggleFollow = useMutation(api.follows.toggle);
  const blockUser = useMutation(api.safety.block);
  const reportUser = useMutation(api.safety.report);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cover & avatar editing
  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // About / edit form
  const [editingAbout, setEditingAbout] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [clan, setClan] = useState(user.clan ?? "");
  const [hometown, setHometown] = useState(user.hometown ?? "");
  const [skillsText, setSkillsText] = useState((user.skills ?? []).join(", "));
  const [interestsText, setInterestsText] = useState((user.interests ?? []).join(", "));
  const [language, setLanguage] = useState<"english" | "dholuo" | "both">(
    (user.language as "english" | "dholuo" | "both") ?? "both",
  );
  const [savingAbout, setSavingAbout] = useState(false);

  const coverSrc = coverPreview ?? coverImageSrc(user);
  const avatarSrc = avatarPreview ?? avatarUrl(user);
  const postCount = posts?.length ?? 0;
  const photoPosts = (posts as FeedPost[] | undefined)?.filter((p) => p.imageUrl) ?? [];

  const uploadCover = useCallback(
    async (file: File) => {
      if (!isOwnProfile) return;
      setUploadingCover(true);
      setError(null);
      const preview = URL.createObjectURL(file);
      setCoverPreview(preview);
      try {
        const storageId = await uploadImageToConvex(file, () =>
          generateUploadUrl(),
        );
        await updateProfile({ coverStorageId: storageId });
      } catch (err) {
        setCoverPreview(null);
        URL.revokeObjectURL(preview);
        setError(formatConvexError(err));
      } finally {
        setUploadingCover(false);
      }
    },
    [generateUploadUrl, isOwnProfile, updateProfile],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!isOwnProfile) return;
      setUploadingAvatar(true);
      setError(null);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
      try {
        const storageId = await uploadImageToConvex(file, () =>
          generateUploadUrl(),
        );
        await updateProfile({ avatarStorageId: storageId });
      } catch (err) {
        setAvatarPreview(null);
        URL.revokeObjectURL(preview);
        setError(formatConvexError(err));
      } finally {
        setUploadingAvatar(false);
      }
    },
    [generateUploadUrl, isOwnProfile, updateProfile],
  );

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) void uploadCover(file);
    e.target.value = "";
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type.startsWith("image/")) void uploadAvatar(file);
    e.target.value = "";
  }

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

  async function saveAbout(e: React.FormEvent) {
    e.preventDefault();
    setSavingAbout(true);
    setError(null);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        clan: clan.trim(),
        hometown: hometown.trim(),
        skills: skillsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12),
        interests: interestsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 12),
        language,
      });
      setEditingAbout(false);
    } catch (err) {
      setError(formatConvexError(err));
    } finally {
      setSavingAbout(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl pb-8">
      {/* Cover + avatar hero */}
      <section className="card-dark overflow-hidden">
        <div className="relative h-44 sm:h-52 md:h-60">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt=""
              fill
              className="object-cover"
              unoptimized
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-stone-900 to-[#121212]"
              aria-hidden
            />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-amber-600/10"
            aria-hidden
          />

          {isOwnProfile && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onCoverChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-3 right-3 z-20 gap-1.5 border-0 bg-black/50 text-white shadow-lg backdrop-blur-sm hover:bg-black/65"
              >
                {uploadingCover ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
                Edit cover
              </Button>
            </>
          )}

          {/* Profile picture */}
          <div className="absolute -bottom-14 left-4 z-20 sm:left-6 sm:-bottom-16">
            <div className="relative">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl ring-2 ring-primary/30 sm:h-32 sm:w-32">
                <Image
                  src={avatarSrc}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="128px"
                />
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="size-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full border-2 border-white bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
                    aria-label="Edit profile picture"
                  >
                    <Camera className="size-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Identity + actions */}
        <div className="px-4 pt-20 pb-5 sm:px-6 sm:pt-22">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                {user.displayName}
              </h1>
              <p className="text-sm text-on-surface-muted">@{user.username}</p>

              {user.bio && (
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-surface-muted">
                  {user.bio}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-on-surface-dim">
                {user.hometown && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    {user.hometown}
                  </span>
                )}
                {user.clan && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-on-surface-muted">
                    <Users className="size-4 shrink-0 text-primary" />
                    {user.clan}
                  </span>
                )}
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {isOwnProfile ? (
                <Button
                  type="button"
                  variant="luoOutline"
                  onClick={() => {
                    setEditingAbout(true);
                    setActiveTab("about");
                  }}
                  className="gap-1.5"
                >
                  <Pencil className="size-4" />
                  Edit profile
                </Button>
              ) : (
                <>
                  <FriendActionButton otherUserId={user._id as Id<"users">} />
                  <Button
                    type="button"
                    variant={isFollowing ? "luoOutline" : "luo"}
                    disabled={followLoading}
                    onClick={onFollow}
                  >
                    {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
                  </Button>
                  <Link
                    href={`/messages?with=${user.username}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface-muted hover:bg-surface-elevated"
                  >
                    Message
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-outline-soft bg-surface-elevated/80 p-4 sm:gap-4">
            <StatItem label="Followers" value={stats?.followers ?? 0} />
            <StatItem label="Following" value={stats?.following ?? 0} />
            <StatItem label="Posts" value={postCount} />
          </div>
        </div>
      </section>

      {error && (
        <p className="mt-3 px-1 text-center text-sm text-error" role="alert">
          {error}
        </p>
      )}

      {/* Tabs */}
      <nav
        className="mt-4 flex gap-1 overflow-x-auto border-b border-outline-soft px-1 hide-scrollbar"
        aria-label="Profile sections"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-muted hover:text-on-surface",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Tab panels */}
      <div className="mt-4 space-y-4">
        {activeTab === "posts" && (
          <>
            <ProfileReels
              userId={user._id as Id<"users">}
              username={user.username}
              isOwnProfile={isOwnProfile}
            />
            {posts === undefined && (
              <p className="py-8 text-center text-sm text-on-surface-muted">
                Loading posts…
              </p>
            )}
            {posts?.length === 0 && (
              <div className="card-dark p-10 text-center text-sm text-on-surface-muted">
                {isOwnProfile
                  ? "You haven't posted yet. Share from the feed."
                  : "No posts yet."}
              </div>
            )}
            {(posts as FeedPost[] | undefined)?.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUserId={me?._id}
              />
            ))}
          </>
        )}

        {activeTab === "about" && (
          <div className="card-dark p-5 sm:p-6">
            {editingAbout && isOwnProfile ? (
              <form onSubmit={saveAbout} className="space-y-4">
                <Field label="Display name">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Bio">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell the community about yourself…"
                    className={inputClass}
                  />
                </Field>
                <Field label="Clan">
                  <input
                    value={clan}
                    onChange={(e) => setClan(e.target.value)}
                    placeholder="e.g. Jok'Onyango"
                    className={inputClass}
                  />
                </Field>
                <Field label="Location / hometown">
                  <input
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    placeholder="e.g. Kisumu · Brisbane"
                    className={inputClass}
                  />
                </Field>
                <Field label="Skills (comma separated)">
                  <input
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Interests (comma separated)">
                  <input
                    value={interestsText}
                    onChange={(e) => setInterestsText(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Language">
                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value as "english" | "dholuo" | "both")
                    }
                    className={inputClass}
                  >
                    <option value="both">English & Dholuo</option>
                    <option value="english">English</option>
                    <option value="dholuo">Dholuo</option>
                  </select>
                </Field>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="luo" disabled={savingAbout}>
                    {savingAbout ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="luoOutline"
                    onClick={() => setEditingAbout(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <dl className="space-y-4 text-sm">
                <AboutRow label="Bio" value={user.bio} />
                <AboutRow label="Clan" value={user.clan} />
                <AboutRow label="Location" value={user.hometown} />
                <AboutRow
                  label="Language"
                  value={
                    user.language === "dholuo"
                      ? "Dholuo"
                      : user.language === "english"
                        ? "English"
                        : user.language
                          ? "English & Dholuo"
                          : undefined
                  }
                />
                {user.skills && user.skills.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-dim">
                      Skills
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {user.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-on-surface-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {user.interests && user.interests.length > 0 && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-dim">
                      Interests
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {user.interests.map((i) => (
                        <span
                          key={i}
                          className="rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {i}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="card-dark p-4 sm:p-5">
            {photoPosts.length === 0 ? (
              <p className="py-10 text-center text-sm text-on-surface-muted">
                No photos yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {photoPosts.map((post) => (
                  <a
                    key={post._id}
                    href={`/feeds#post-${post._id}`}
                    className="relative aspect-square overflow-hidden rounded-xl bg-surface-elevated ring-1 ring-outline-soft transition-opacity hover:opacity-90"
                  >
                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="200px"
                      />
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            {userEvents === undefined && (
              <p className="text-center text-sm text-on-surface-muted">Loading…</p>
            )}
            {userEvents?.length === 0 && (
              <div className="card-dark p-10 text-center text-sm text-on-surface-muted">
                {isOwnProfile ? (
                  <>
                    No events yet.{" "}
                    <Link href="/events" className="font-semibold text-primary underline">
                      Create one
                    </Link>
                  </>
                ) : (
                  "No events from this member yet."
                )}
              </div>
            )}
            {userEvents?.map((event) => (
              <div key={event._id} className="card-dark p-4 sm:p-5">
                <p className="font-bold text-on-surface">{event.title}</p>
                <p className="mt-1 text-xs text-on-surface-dim">
                  {new Date(event.startsAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {event.location ? ` · ${event.location}` : ""}
                </p>
                {event.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-on-surface-muted">
                    {event.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold tabular-nums text-on-surface sm:text-2xl">
        {value}
      </p>
      <p className="text-xs font-medium text-on-surface-dim">{label}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-on-surface-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function AboutRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-on-surface-dim">
        {label}
      </dt>
      <dd className="mt-1 text-on-surface">{value}</dd>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-outline bg-surface-elevated px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-dim focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
