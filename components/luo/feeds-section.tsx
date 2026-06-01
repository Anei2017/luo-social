"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FEEDS_PATH } from "@/lib/feeds-path";
import type { FeedTab } from "@/lib/posts-api";
import { COMMUNITY_LINKS } from "@/lib/community-sections";
import { InfiniteFeed } from "@/components/feed/infinite-feed";
import { StoriesRow } from "./stories-row";
import { ComposeBox } from "./compose-box";
import { FeedScrollEffects } from "./feed-scroll-effects";

export type { FeedTab };

const TAB_CONFIG: { id: FeedTab; label: string; hint: string }[] = [
  {
    id: "everyone",
    label: "Everyone",
    hint: "All posts from the community",
  },
  {
    id: "friends",
    label: "Friends",
    hint: "Posts from people you're friends with",
  },
  {
    id: "following",
    label: "Following",
    hint: "Posts from people you follow",
  },
];

function tabFromParam(value: string | null): FeedTab {
  if (value === "friends" || value === "following") return value;
  return "everyone";
}

export function FeedsSection() {
  const searchParams = useSearchParams();
  const initialTab = tabFromParam(searchParams.get("tab"));

  const [tab, setTab] = useState<FeedTab>(initialTab);
  const [topic, setTopic] = useState<string>("All");
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  const me = useQuery(api.users.current);
  const topics = useQuery(api.posts.feedTopics);

  const setTabAndUrl = useCallback((next: FeedTab) => {
    setTab(next);
    const params = new URLSearchParams(window.location.search);
    if (next === "everyone") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    window.history.replaceState(
      null,
      "",
      qs ? `${FEEDS_PATH}?${qs}` : FEEDS_PATH,
    );
  }, []);

  const activeConfig = TAB_CONFIG.find((t) => t.id === tab)!;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <FeedScrollEffects />

      <header className="card-dark p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-on-surface sm:text-2xl">Feeds</h1>
            <p className="mt-1 text-sm text-on-surface-muted">
              Post, like, and comment — switch tabs to filter who you see.
            </p>
          </div>
          <div className="hide-scrollbar flex max-w-[55%] shrink-0 gap-1 overflow-x-auto sm:max-w-none">
            {COMMUNITY_LINKS.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full border border-outline px-2.5 py-1.5 text-[10px] font-semibold text-primary sm:text-xs"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTabAndUrl(t.id)}
              className={`min-h-11 flex-1 rounded-full px-3 py-2.5 text-sm font-semibold ${
                tab === t.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-elevated text-on-surface-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-on-surface-dim">{activeConfig.hint}</p>
      </header>

      <StoriesRow />

      {topics && topics.length > 0 && (
        <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setTopic("All")}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
              topic === "All"
                ? "bg-primary text-on-primary"
                : "bg-surface-elevated text-on-surface-muted"
            }`}
          >
            All topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${
                topic === t
                  ? "bg-primary text-on-primary"
                  : "bg-surface-elevated text-on-surface-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <ComposeBox
        onPosted={() => {
          setTabAndUrl("everyone");
          setFeedRefreshKey((k) => k + 1);
        }}
      />

      <InfiniteFeed
        key={feedRefreshKey}
        tab={tab}
        topic={topic}
        currentUserId={me?._id}
        emptyAction={
          tab === "friends" ? (
            <Link
              href="/friends"
              className="inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-on-primary"
            >
              Find friends
            </Link>
          ) : undefined
        }
      />
    </div>
  );
}
