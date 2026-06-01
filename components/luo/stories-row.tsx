"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { avatarUrl } from "@/lib/avatar";
import { uploadImageToConvex } from "@/lib/upload-image";
import { formatConvexError } from "@/lib/convex-errors";

export function StoriesRow() {
  const { user } = useUser();
  const profile = useQuery(api.users.current);
  const storyFeed = useQuery(api.stories.feed);
  const createStory = useMutation(api.stories.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onAddStory(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    try {
      const id = await uploadImageToConvex(file, () => generateUploadUrl());
      await createStory({ imageStorageId: id });
    } catch (err) {
      alert(formatConvexError(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <section className="card-dark hide-scrollbar overflow-x-auto p-4">
      <p className="mb-3 text-xs font-semibold text-on-surface-muted">
        Stories · 24 hours
      </p>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 flex-col items-center gap-2"
        >
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-surface-elevated ring-2 ring-dashed ring-primary ring-offset-2 ring-offset-surface">
            <span className="text-2xl text-primary">+</span>
          </div>
          <span className="font-body text-xs font-medium text-primary">
            {uploading ? "…" : "Add"}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onAddStory}
          />
        </button>

        <Link href="/profile" className="flex shrink-0 flex-col items-center gap-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-surface">
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

        {storyFeed?.map((bundle) =>
          bundle.author ? (
            <Link
              key={bundle.author._id}
              href={`/profile/${bundle.author.username}`}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-primary/80 ring-offset-2 ring-offset-surface">
                {bundle.stories[0]?.imageUrl ? (
                  <Image
                    src={bundle.stories[0].imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="56px"
                  />
                ) : (
                  <Image
                    src={avatarUrl(bundle.author)}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="56px"
                  />
                )}
              </div>
              <span className="font-body max-w-[4.5rem] truncate text-xs text-on-surface-muted">
                {bundle.author.displayName.split(" ")[0]}
              </span>
            </Link>
          ) : null,
        )}
      </div>
    </section>
  );
}
