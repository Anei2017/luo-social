"use client";

/**
 * Luo Social — User Profile Page
 * Modern, warm, culturally welcoming layout for the Luo community.
 * Uses Lucide icons, TanStack Query infinite scroll for posts, and Convex for data.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  BadgeCheck,
  Briefcase,
  Calendar,
  Camera,
  Flag,
  ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  ShieldAlert,
  UserX,
  Users,
  Video,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { coverImageSrc } from "@/lib/cover";
import { formatConvexError } from "@/lib/convex-errors";
import type { ConvexUser, FeedPost } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useProfileImages } from "@/hooks/use-profile-images";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FriendActionButton } from "@/components/luo/friend-action-button";
import { PostCard } from "@/components/luo/post-card";
import { ProfileReels } from "@/components/luo/profile-reels";
import { ProfilePostsInfinite } from "@/components/profile/profile-posts-infinite";
import { ProfilePageSkeleton } from "@/components/profile/profile-skeleton";

// ——— Tab configuration ———
export type ProfileTab =
  | "posts"
  | "replies"
  | "photos"
  | "videos"
  | "about"
  | "events"
  | "clan";

const PROFILE_TABS: {
  id: ProfileTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "posts", label: "Posts", icon: ImageIcon },
  { id: "replies", label: "Replies", icon: MessageCircle },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "videos", label: "Videos", icon: Video },
  { id: "about", label: "About", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "clan", label: "Clan", icon: Flag },
];

export type ProfilePageProps = {
  user: ConvexUser;
  isOwnProfile: boolean;
  /** Set true while parent loads user document */
  loading?: boolean;
};

export function ProfilePage({
  user,
  isOwnProfile,
  loading = false,
}: ProfilePageProps) {
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
  const postsPreview = useQuery(api.posts.byAuthor, {
    userId: user._id as Id<"users">,
    limit: 60,
  });
  const replies = useQuery(api.comments.listByAuthor, {
    userId: user._id as Id<"users">,
  });
  const userEvents = useQuery(api.events.byAuthor, {
    userId: user._id as Id<"users">,
  });
  const blocked = useQuery(
    api.safety.isBlocked,
    !isOwnProfile ? { userId: user._id as Id<"users"> } : "skip",
  );

  const updateProfile = useMutation(api.users.updateProfile);
  const toggleFollow = useMutation(api.follows.toggle);
  const blockUser = useMutation(api.safety.block);
  const reportUser = useMutation(api.safety.report);

  const images = useProfileImages(isOwnProfile);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
  const [followLoading, setFollowLoading] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // About form state
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? "");
  const [clan, setClan] = useState(user.clan ?? "");
  const [hometown, setHometown] = useState(user.hometown ?? "");
  const [currentLocation, setCurrentLocation] = useState(user.currentLocation ?? "");
  const [occupation, setOccupation] = useState(user.occupation ?? "");
  const [proudLuo, setProudLuo] = useState(user.proudLuo ?? false);
  const [skillsText, setSkillsText] = useState((user.skills ?? []).join(", "));
  const [interestsText, setInterestsText] = useState((user.interests ?? []).join(", "));
  const [savingAbout, setSavingAbout] = useState(false);

  useEffect(() => {
    setDisplayName(user.displayName);
    setBio(user.bio ?? "");
    setClan(user.clan ?? "");
    setHometown(user.hometown ?? "");
    setCurrentLocation(user.currentLocation ?? "");
    setOccupation(user.occupation ?? "");
    setProudLuo(user.proudLuo ?? false);
  }, [user]);

  if (loading) return <ProfilePageSkeleton />;

  const coverSrc = images.coverPreview ?? coverImageSrc(user);
  const avatarSrc = images.avatarPreview ?? avatarUrl(user);
  const postCount = postsPreview?.length ?? 0;
  const photoPosts =
    (postsPreview as FeedPost[] | undefined)?.filter((p) => p.imageUrl) ?? [];
  const joinedLabel = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      })
    : null;

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${user.username}`
      : `/profile/${user.username}`;

  async function onFollow() {
    setFollowLoading(true);
    setActionError(null);
    try {
      await toggleFollow({ followingId: user._id as Id<"users"> });
    } catch (err) {
      setActionError(formatConvexError(err));
    } finally {
      setFollowLoading(false);
    }
  }

  async function onShareProfile() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${user.displayName} on LUO SOCIAL`,
          url: profileUrl,
        });
      } else {
        await navigator.clipboard.writeText(profileUrl);
        alert("Profile link copied.");
      }
    } catch {
      /* cancelled */
    }
  }

  async function onReport() {
    const reason = prompt("Why are you reporting this profile?");
    if (!reason?.trim()) return;
    try {
      await reportUser({
        targetUserId: user._id as Id<"users">,
        reason: reason.trim(),
      });
      alert("Report submitted. Thank you.");
    } catch (err) {
      setActionError(formatConvexError(err));
    }
  }

  async function onBlock() {
    if (!confirm("Block this user?")) return;
    try {
      await blockUser({ userId: user._id as Id<"users"> });
    } catch (err) {
      setActionError(formatConvexError(err));
    }
  }

  async function saveAbout(e: React.FormEvent) {
    e.preventDefault();
    setSavingAbout(true);
    setActionError(null);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim(),
        clan: clan.trim(),
        hometown: hometown.trim(),
        currentLocation: currentLocation.trim(),
        occupation: occupation.trim(),
        proudLuo,
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
      });
      setEditingAbout(false);
    } catch (err) {
      setActionError(formatConvexError(err));
    } finally {
      setSavingAbout(false);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl pb-12">
      {/* Subtle cultural pattern (whole page) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      {/* ——— Hero: cover + avatar ——— */}
      <section className="relative overflow-hidden rounded-none border border-amber-900/20 bg-surface shadow-[var(--luo-card-shadow)] sm:rounded-2xl dark:border-amber-900/20">
        <div className="relative aspect-[820/312] max-h-[220px] w-full sm:max-h-[312px]">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt=""
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              unoptimized
              priority
              sizes="(max-width: 768px) 100vw, 820px"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-emerald-100 dark:from-amber-950 dark:via-stone-900 dark:to-emerald-950"
              aria-hidden
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-amber-200/30 dark:from-background dark:via-background/50 dark:to-amber-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/15 via-transparent to-emerald-600/10 dark:from-orange-900/25 dark:to-emerald-900/20" />

          {isOwnProfile && (
            <>
              <input
                ref={images.coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={images.onCoverChange}
              />
              <button
                type="button"
                disabled={images.uploadingCover}
                onClick={images.openCoverPicker}
                className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full bg-black/55 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-black/70"
              >
                {images.uploadingCover ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
                Edit cover
              </button>
            </>
          )}
        </div>

        {/* Avatar — 180×180 */}
        <div className="relative px-4 sm:px-8">
          <div className="absolute -top-[90px] left-4 z-20 sm:-top-[90px] sm:left-8">
            <div className="group relative">
              <div className="relative size-[140px] overflow-hidden rounded-full border-[5px] border-surface shadow-2xl ring-4 ring-primary/30 transition-transform duration-300 group-hover:scale-[1.02] sm:size-[180px]">
                <Image
                  src={avatarSrc}
                  alt={user.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="180px"
                />
                {images.uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="size-10 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <>
                  <input
                    ref={images.avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={images.onAvatarChange}
                  />
                  <button
                    type="button"
                    onClick={images.openAvatarPicker}
                    disabled={images.uploadingAvatar}
                    className="absolute right-1 bottom-1 flex size-11 items-center justify-center rounded-full border-[3px] border-surface bg-gradient-to-br from-primary to-orange-600 text-on-primary shadow-lg transition hover:scale-105 active:scale-95"
                    aria-label="Edit profile picture"
                  >
                    <Camera className="size-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="pt-[88px] pb-6 sm:pt-[100px]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
                    {user.displayName}
                  </h1>
                  {user.isVerified && (
                    <BadgeCheck
                      className="size-6 shrink-0 text-sky-400"
                      aria-label="Verified"
                    />
                  )}
                  {user.proudLuo && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary/20 to-orange-600/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-earth ring-1 ring-primary/35 dark:text-amber-300">
                      <Flag className="size-3" />
                      Proud Luo
                    </span>
                  )}
                </div>
                <p className="text-sm text-on-surface-muted">@{user.username}</p>

                {user.bio && (
                  <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-on-surface-muted">
                    {user.bio}
                  </p>
                )}

                <ul className="mt-4 flex flex-col gap-2 text-sm text-on-surface-dim sm:flex-row sm:flex-wrap sm:gap-x-5">
                  {user.clan && (
                    <li className="inline-flex items-center gap-1.5">
                      <Users className="size-4 text-amber-500" />
                      <span className="font-medium text-on-surface-muted">
                        {user.clan}
                      </span>
                    </li>
                  )}
                  {user.hometown && (
                    <li className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-emerald-500" />
                      {user.hometown}
                    </li>
                  )}
                  {user.currentLocation && (
                    <li className="inline-flex items-center gap-1.5">
                      <MapPin className="size-4 text-orange-400" />
                      Lives in {user.currentLocation}
                    </li>
                  )}
                  {user.occupation && (
                    <li className="inline-flex items-center gap-1.5">
                      <Briefcase className="size-4 text-amber-600" />
                      {user.occupation}
                    </li>
                  )}
                  {joinedLabel && (
                    <li className="inline-flex items-center gap-1.5">
                      <Calendar className="size-4 text-on-surface-dim" />
                      Joined {joinedLabel}
                    </li>
                  )}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {isOwnProfile ? (
                  <Button
                    type="button"
                    variant="luo"
                    onClick={() => {
                      setEditingAbout(true);
                      setActiveTab("about");
                    }}
                    className="gap-1.5 shadow-md"
                  >
                    Edit profile
                  </Button>
                ) : (
                  <>
                    <FriendActionButton
                      otherUserId={user._id as Id<"users">}
                    />
                    <Button
                      type="button"
                      variant={isFollowing ? "luoOutline" : "luo"}
                      disabled={followLoading}
                      onClick={onFollow}
                      className="min-w-[100px] transition-transform hover:scale-[1.02]"
                    >
                      {followLoading
                        ? "…"
                        : isFollowing
                          ? "Following"
                          : "Follow"}
                    </Button>
                    <Link
                      href={`/messages?with=${user.username}`}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-outline px-5 py-2.5 text-sm font-semibold text-on-surface-muted transition hover:scale-[1.02] hover:bg-surface-elevated"
                    >
                      <MessageCircle className="size-4" />
                      Message
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label="More actions"
                        className="flex size-10 items-center justify-center rounded-full border border-outline text-on-surface-muted transition hover:bg-surface-elevated hover:text-on-surface"
                      >
                        <MoreHorizontal className="size-5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[180px] border-outline bg-surface"
                      >
                        <DropdownMenuItem
                          onClick={onShareProfile}
                          className="gap-2"
                        >
                          <Share2 className="size-4" />
                          Share profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={onReport}
                          className="gap-2 text-error"
                        >
                          <ShieldAlert className="size-4" />
                          Report
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={onBlock}
                          className="gap-2 text-error"
                        >
                          <UserX className="size-4" />
                          {blocked ? "Blocked" : "Block"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <StatCard label="Followers" value={stats?.followers ?? 0} />
              <StatCard label="Following" value={stats?.following ?? 0} />
              <StatCard label="Posts" value={postCount} />
              <StatCard
                label="Connections"
                value={friendStats?.friends ?? 0}
                accent="emerald"
              />
            </div>
          </div>
        </div>
      </section>

      {(actionError || images.error) && (
        <p className="mt-3 text-center text-sm text-error" role="alert">
          {actionError ?? images.error}
        </p>
      )}

      {/* ——— Tabs ——— */}
      <nav
        className="mt-5 flex gap-1 overflow-x-auto border-b border-outline pb-px hide-scrollbar"
        aria-label="Profile sections"
      >
        {PROFILE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-semibold transition-colors sm:px-4",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-muted hover:border-outline hover:text-on-surface",
              )}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ——— Tab panels ——— */}
      <div className="relative mt-5 space-y-4">
        {activeTab === "posts" && (
          <ProfilePostsInfinite
            userId={user._id}
            currentUserId={me?._id}
          />
        )}

        {activeTab === "replies" && (
          <div className="space-y-3">
            {replies === undefined && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-2xl bg-surface-elevated"
                  />
                ))}
              </div>
            )}
            {replies?.length === 0 && (
              <EmptyPanel text="No replies yet." />
            )}
            {replies?.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-outline/80 bg-surface/90 p-4 transition hover:border-amber-800/30"
              >
                <p className="text-sm text-on-surface">{c.content}</p>
                {c.post && (
                  <Link
                    href={`/feeds#post-${c.post._id}`}
                    className="mt-2 block truncate text-xs text-amber-500/90 hover:underline"
                  >
                    On post: {c.post.content}
                  </Link>
                )}
                <p className="mt-2 text-[10px] text-on-surface-dim">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="rounded-2xl border border-outline/80 bg-surface/90 p-4 sm:p-5">
            {photoPosts.length === 0 ? (
              <EmptyPanel text="No photos yet." />
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-3">
                {photoPosts.map((post) => (
                  <Link
                    key={post._id}
                    href={`/feeds#post-${post._id}`}
                    className="group relative aspect-square overflow-hidden rounded-xl ring-1 ring-amber-900/20 transition hover:ring-amber-500/50"
                  >
                    {post.imageUrl && (
                      <Image
                        src={post.imageUrl}
                        alt=""
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        unoptimized
                        sizes="200px"
                      />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "videos" && (
          <ProfileReels
            userId={user._id as Id<"users">}
            username={user.username}
            isOwnProfile={isOwnProfile}
          />
        )}

        {activeTab === "about" && (
          <AboutPanel
            user={user}
            isOwnProfile={isOwnProfile}
            editing={editingAbout}
            setEditing={setEditingAbout}
            displayName={displayName}
            setDisplayName={setDisplayName}
            bio={bio}
            setBio={setBio}
            clan={clan}
            setClan={setClan}
            hometown={hometown}
            setHometown={setHometown}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            occupation={occupation}
            setOccupation={setOccupation}
            proudLuo={proudLuo}
            setProudLuo={setProudLuo}
            skillsText={skillsText}
            setSkillsText={setSkillsText}
            interestsText={interestsText}
            setInterestsText={setInterestsText}
            saving={savingAbout}
            onSubmit={saveAbout}
            joinedLabel={joinedLabel}
          />
        )}

        {activeTab === "events" && (
          <div className="space-y-3">
            {userEvents?.length === 0 && (
              <EmptyPanel
                text={
                  isOwnProfile
                    ? "No events yet — create one in Events."
                    : "No events from this member."
                }
              />
            )}
            {userEvents?.map((event) => (
              <div
                key={event._id}
                className="rounded-2xl border border-emerald-900/25 bg-gradient-to-br from-surface to-emerald-950/20 p-5 transition hover:border-emerald-700/40"
              >
                <p className="font-bold text-on-surface">{event.title}</p>
                <p className="mt-1 text-xs text-on-surface-dim">
                  {new Date(event.startsAt).toLocaleString()}
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

        {activeTab === "clan" && (
          <div className="rounded-2xl border border-amber-800/30 bg-gradient-to-br from-amber-950/40 via-surface to-stone-900 p-6 sm:p-8">
            <h2 className="font-headline text-xl font-bold text-amber-200">
              {user.clan ?? "Your clan"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-muted">
              Clan identity connects Luos across the diaspora — from Nile Valley
              heritage to communities in Kenya, Uganda, Tanzania, and beyond.
            </p>
            {user.clan ? (
              <p className="mt-4 text-lg font-semibold text-on-surface">
                {user.clan}
              </p>
            ) : (
              <p className="mt-4 text-sm text-on-surface-dim">
                {isOwnProfile
                  ? "Add your clan in Edit profile → About."
                  : "Clan not shared yet."}
              </p>
            )}
            <Link
              href="/groups"
              className="mt-6 inline-flex rounded-full bg-amber-500/20 px-5 py-2.5 text-sm font-bold text-amber-200 ring-1 ring-amber-500/40 transition hover:bg-amber-500/30"
            >
              Explore Luo groups
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ——— Subcomponents ———

function StatCard({
  label,
  value,
  accent = "amber",
}: {
  label: string;
  value: number;
  accent?: "amber" | "emerald";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-4 text-center transition duration-300 hover:scale-[1.02] hover:shadow-md",
        accent === "emerald"
          ? "border-emerald-200 bg-emerald-50/80 hover:border-emerald-400 dark:border-emerald-800/30 dark:bg-emerald-950/25 dark:hover:border-emerald-600/40"
          : "border-orange-200 bg-orange-50/80 hover:border-primary/50 dark:border-amber-800/25 dark:bg-amber-950/20 dark:hover:border-amber-600/35",
      )}
    >
      <p className="text-xl font-bold tabular-nums text-on-surface sm:text-2xl">
        {value}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-on-surface-dim">
        {label}
      </p>
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="card-surface rounded-2xl border border-dashed border-outline bg-surface/80 p-10 text-center text-sm text-on-surface-muted">
      {text}
    </div>
  );
}

function AboutPanel({
  user,
  isOwnProfile,
  editing,
  setEditing,
  displayName,
  setDisplayName,
  bio,
  setBio,
  clan,
  setClan,
  hometown,
  setHometown,
  currentLocation,
  setCurrentLocation,
  occupation,
  setOccupation,
  proudLuo,
  setProudLuo,
  skillsText,
  setSkillsText,
  interestsText,
  setInterestsText,
  saving,
  onSubmit,
  joinedLabel,
}: {
  user: ConvexUser;
  isOwnProfile: boolean;
  editing: boolean;
  setEditing: (v: boolean) => void;
  displayName: string;
  setDisplayName: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  clan: string;
  setClan: (v: string) => void;
  hometown: string;
  setHometown: (v: string) => void;
  currentLocation: string;
  setCurrentLocation: (v: string) => void;
  occupation: string;
  setOccupation: (v: string) => void;
  proudLuo: boolean;
  setProudLuo: (v: boolean) => void;
  skillsText: string;
  setSkillsText: (v: string) => void;
  interestsText: string;
  setInterestsText: (v: string) => void;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  joinedLabel: string | null;
}) {
  const inputClass =
    "w-full rounded-xl border border-amber-900/30 bg-surface-elevated px-4 py-2.5 text-sm text-on-surface focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 focus:outline-none";

  return (
    <div className="rounded-2xl border border-outline/80 bg-surface/95 p-5 sm:p-7">
      {editing && isOwnProfile ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className={inputClass}
            />
          </FormField>
          <FormField label="Clan">
            <input
              value={clan}
              onChange={(e) => setClan(e.target.value)}
              placeholder="e.g. Jok'Onyango"
              className={inputClass}
            />
          </FormField>
          <FormField label="Hometown">
            <input
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Current location">
            <input
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Occupation">
            <input
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={proudLuo}
              onChange={(e) => setProudLuo(e.target.checked)}
              className="size-4 rounded border-amber-700 accent-amber-500"
            />
            Show Proud Luo badge on my profile
          </label>
          <FormField label="Skills (comma separated)">
            <input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <FormField label="Interests (comma separated)">
            <input
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              className={inputClass}
            />
          </FormField>
          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="luo" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              variant="luoOutline"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          {isOwnProfile && (
            <Button
              type="button"
              variant="luoOutline"
              className="mb-4"
              onClick={() => setEditing(true)}
            >
              Edit about
            </Button>
          )}
          <dl className="space-y-4 text-sm">
            <AboutRow label="Bio" value={user.bio} />
            <AboutRow label="Clan" value={user.clan} />
            <AboutRow label="Hometown" value={user.hometown} />
            <AboutRow label="Current location" value={user.currentLocation} />
            <AboutRow label="Occupation" value={user.occupation} />
            {joinedLabel && (
              <AboutRow label="Joined" value={joinedLabel} />
            )}
          </dl>
        </>
      )}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-amber-200/80">
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
