"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";

export function StoriesRow() {
  const { user } = useUser();
  const profile = useQuery(api.users.current);
  const following = useQuery(
    api.follows.listFollowing,
    profile ? { userId: profile._id as Id<"users">, limit: 8 } : "skip",
  );

  return (
    <section className="card-dark hide-scrollbar overflow-x-auto p-4">
      <div className="flex gap-4">
        <Link
          href="/profile"
          className="flex shrink-0 flex-col items-center gap-2"
        >
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-surface-elevated ring-2 ring-primary ring-offset-2 ring-offset-surface">
            <Image
              src={
                profile
                  ? avatarUrl(profile)
                  : avatarUrl({ avatarUrl: user?.imageUrl ?? undefined, username: "me" })
              }
              alt="You"
              fill
              className="object-cover"
              unoptimized
              sizes="56px"
            />
          </div>
          <span className="font-body text-xs font-medium text-on-surface">You</span>
        </Link>
        {following?.map((person) =>
          person ? (
            <Link
              key={person._id}
              href={`/profile/${person.username}`}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-surface-elevated ring-2 ring-primary/60 ring-offset-2 ring-offset-surface">
                <Image
                  src={avatarUrl(person)}
                  alt={person.displayName}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="56px"
                />
              </div>
              <span className="font-body max-w-[4.5rem] truncate text-xs text-on-surface-muted">
                {person.displayName.split(" ")[0]}
              </span>
            </Link>
          ) : null,
        )}
        {following?.length === 0 && (
          <p className="flex items-center px-2 text-xs text-on-surface-dim">
            Follow people to see them here
          </p>
        )}
      </div>
    </section>
  );
}
