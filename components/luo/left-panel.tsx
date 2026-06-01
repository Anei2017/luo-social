"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { CommunityLinksPanel } from "./community-links-panel";

export function LeftPanel() {
  const { user: clerkUser } = useUser();
  const profile = useQuery(api.users.current);
  const stats = useQuery(
    api.follows.stats,
    profile ? { userId: profile._id as Id<"users"> } : "skip",
  );
  const following = useQuery(
    api.follows.listFollowing,
    profile ? { userId: profile._id as Id<"users">, limit: 6 } : "skip",
  );
  const members = useQuery(
    api.users.listMembers,
    profile ? { limit: 6 } : "skip",
  );
  const suggestions = useQuery(
    api.users.peopleYouMayKnow,
    profile ? { limit: 5 } : "skip",
  );

  const name = profile?.displayName ?? clerkUser?.fullName ?? "Your name";
  const handle = profile?.username ? `@${profile.username}` : "@username";
  const skills = profile?.skills?.length ? profile.skills : [];

  return (
    <aside className="hidden w-[280px] shrink-0 space-y-4 xl:block">
      <div className="card-dark overflow-hidden p-5">
        <div className="profile-arches relative mx-auto mb-2 flex h-32 items-end justify-center">
          <div className="relative z-10 h-20 w-20 overflow-hidden rounded-full border-4 border-background bg-surface-elevated">
            <Image
              src={avatarUrl(profile ?? { avatarUrl: clerkUser?.imageUrl })}
              alt=""
              fill
              className="object-cover"
              unoptimized
              sizes="80px"
            />
          </div>
        </div>
        <div className="mb-4 flex justify-center gap-8 text-xs text-on-surface-muted">
          <span>
            <strong className="text-on-surface">{stats?.followers ?? 0}</strong>{" "}
            Followers
          </span>
          <span>
            <strong className="text-on-surface">{stats?.following ?? 0}</strong>{" "}
            Following
          </span>
        </div>

        <div className="text-center">
          <h2 className="font-body text-lg font-bold text-on-surface">{name}</h2>
          <p className="font-body text-sm text-on-surface-muted">{handle}</p>
          {profile?.bio && (
            <p className="font-body mt-3 text-sm leading-relaxed text-on-surface-muted">
              {profile.bio}
            </p>
          )}
          <Link
            href={profile?.username ? `/profile/${profile.username}` : "/profile"}
            className="font-body mt-4 inline-flex w-full items-center justify-center rounded-full bg-surface-elevated py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-input"
          >
            My Profile
          </Link>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="card-dark p-5">
          <h3 className="font-body mb-3 text-sm font-bold text-on-surface">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-medium text-on-surface-muted"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <CommunityLinksPanel />

      {suggestions && suggestions.length > 0 && (
        <div className="card-dark p-5">
          <h3 className="font-body mb-3 text-sm font-bold text-on-surface">
            People you may know
          </h3>
          <ul className="space-y-3">
            {suggestions.map((person) => (
              <li key={person._id}>
                <Link
                  href={`/profile/${person.username}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative h-9 w-9 overflow-hidden rounded-full">
                    <Image
                      src={avatarUrl(person)}
                      alt=""
                      fill
                      unoptimized
                      sizes="36px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{person.displayName}</p>
                    <p className="text-xs text-on-surface-dim">@{person.username}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-dark p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-body text-sm font-bold text-on-surface">
            Members
          </h3>
          <Link href="/friends" className="text-xs font-semibold text-primary">
            Friends
          </Link>
        </div>
        {members === undefined && (
          <p className="text-xs text-on-surface-dim">Loading…</p>
        )}
        {members?.length === 0 && (
          <p className="text-xs text-on-surface-dim">You&apos;re the first member here.</p>
        )}
        <ul className="space-y-3">
          {members?.map((person) => (
            <li key={person._id} className="flex items-center gap-2">
              <Link
                href={`/profile/${person.username}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={avatarUrl(person)}
                    alt=""
                    fill
                    unoptimized
                    sizes="36px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {person.displayName}
                  </p>
                  <p className="text-xs text-on-surface-dim">@{person.username}</p>
                </div>
              </Link>
              <Link
                href={`/messages?with=${person.username}`}
                className="shrink-0 text-xs font-bold text-primary"
              >
                Chat
              </Link>
            </li>
          ))}
        </ul>
        {(members?.length ?? 0) > 0 && (
          <Link
            href="/messages"
            className="mt-3 block text-center text-xs font-medium text-on-surface-muted hover:text-primary"
          >
            See all members →
          </Link>
        )}
      </div>

      <div className="card-dark p-5">
        <h3 className="font-body mb-3 text-sm font-bold text-on-surface">
          People you follow
        </h3>
        {following === undefined && (
          <p className="text-xs text-on-surface-dim">Loading…</p>
        )}
        {following?.length === 0 && (
          <p className="text-xs text-on-surface-dim">
            <Link href="/discover" className="text-primary hover:underline">
              Discover creators
            </Link>{" "}
            to follow.
          </p>
        )}
        <ul className="space-y-3">
          {following?.map((person) =>
            person ? (
              <li key={person._id}>
                <Link
                  href={`/profile/${person.username}`}
                  className="flex items-center gap-3"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={avatarUrl(person)}
                      alt=""
                      fill
                      unoptimized
                      sizes="40px"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {person.displayName}
                    </p>
                    <p className="text-xs text-on-surface-dim">@{person.username}</p>
                  </div>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </aside>
  );
}
