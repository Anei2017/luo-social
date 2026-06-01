"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReelCompose } from "./reel-compose";
import { ReelSlide, type ReelItem } from "./reel-slide";
import { ReelsPageHeader } from "./reels-shell";
import { Icon } from "./icon";

export function ReelsViewer() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);

  const me = useQuery(api.users.current);
  const reels = useQuery(api.reels.feed, { limit: 40 });

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !reels?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = slideRefs.current.indexOf(entry.target as HTMLElement);
            if (idx >= 0) setActiveIndex(idx);
          }
        }
      },
      { root, threshold: [0.6] },
    );

    slideRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [reels?.length]);

  return (
    <>
      <ReelsPageHeader onCreateClick={() => setComposeOpen(true)} />
      <ReelCompose open={composeOpen} onClose={() => setComposeOpen(false)} />

      {reels === undefined && (
        <div className="flex h-[50vh] items-center justify-center">
          <Icon name="progress_activity" className="animate-spin text-4xl text-primary" />
        </div>
      )}

      {reels?.length === 0 && (
        <div className="card-dark mx-4 flex flex-col items-center gap-4 p-10 text-center sm:mx-0">
          <Icon name="movie" className="text-6xl text-primary" />
          <h2 className="text-lg font-bold">No reels yet</h2>
          <p className="max-w-sm text-sm text-on-surface-muted">
            Be the first to share a short video — tap Create to upload from your
            phone or computer.
          </p>
          <button
            type="button"
            onClick={() => setComposeOpen(true)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-on-primary"
          >
            Create reel
          </button>
        </div>
      )}

      {reels && reels.length > 0 && (
        <div
          ref={scrollRef}
          className="hide-scrollbar h-[calc(100dvh-10rem)] snap-y snap-mandatory overflow-y-scroll scroll-smooth sm:h-[calc(100dvh-11rem)]"
        >
          {(reels as ReelItem[]).map((reel, i) => (
            <div
              key={reel._id}
              ref={(el) => {
                slideRefs.current[i] = el;
              }}
            >
              <ReelSlide
                reel={reel}
                active={i === activeIndex}
                currentUserId={me?._id}
              />
            </div>
          ))}
          <p className="py-8 text-center text-xs text-on-surface-dim">
            You&apos;re all caught up ·{" "}
            <Link href="/feeds" className="text-primary underline">
              Back to feeds
            </Link>
          </p>
        </div>
      )}
    </>
  );
}
