"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { avatarUrl } from "@/lib/avatar";
import { LuoLogo } from "./logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "./icon";
import { ComposeLink } from "./compose-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationUnreadCount } from "./notification-unread";
import { FEEDS_PATH } from "@/lib/feeds-path";
import { REELS_PATH } from "@/lib/reels-path";

const navIcons = [
  { href: FEEDS_PATH, icon: "dynamic_feed", label: "Feeds" },
  { href: REELS_PATH, icon: "movie", label: "Reels" },
  { href: "/friends", icon: "group", label: "Friends" },
  { href: "/messages", icon: "chat", label: "Messages" },
  { href: "/discover", icon: "explore", label: "Discover" },
  { href: "/notifications", icon: "notifications", label: "Notifications" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const profile = useQuery(api.users.current);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchResults = useQuery(
    api.users.search,
    searchQuery.trim().length >= 2 ? { query: searchQuery } : "skip",
  );

  const displayName = profile?.displayName ?? clerkUser?.fullName ?? "Member";

  function goToUser(username: string) {
    setSearchOpen(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
    router.push(`/profile/${username}`);
  }

  const showResults =
    searchQuery.trim().length >= 2 && searchResults !== undefined;

  function SearchResults({ className }: { className?: string }) {
    if (!showResults) return null;
    return (
      <div
        className={`absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-outline bg-surface py-2 shadow-xl ${className ?? ""}`}
      >
        {searchResults.length === 0 ? (
          <p className="px-4 py-2 text-sm text-on-surface-muted">No users found</p>
        ) : (
          searchResults.map((u) => (
            <button
              key={u._id}
              type="button"
              onClick={() => goToUser(u.username)}
              className="flex w-full min-h-11 items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-elevated active:bg-surface-elevated"
            >
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full">
                <Image src={avatarUrl(u)} alt="" fill unoptimized sizes="32px" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {u.displayName}
                </p>
                <p className="text-xs text-on-surface-dim">@{u.username}</p>
              </div>
            </button>
          ))
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-outline-soft bg-background/95 pt-safe backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-4">
          <div className="relative flex min-w-0 flex-1 items-center gap-2 sm:gap-4 lg:max-w-md">
            <LuoLogo size="sm" showText href={FEEDS_PATH} />
            <div className="relative hidden min-w-0 flex-1 sm:block">
              <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5">
                <Icon name="search" className="shrink-0 text-lg text-on-surface-muted" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search people"
                  className="h-auto min-h-0 border-0 bg-transparent px-0 py-0 text-base shadow-none ring-0 placeholder:text-on-surface-dim focus-visible:ring-0 sm:text-sm"
                />
              </div>
              {searchOpen && <SearchResults />}
            </div>
          </div>

          <nav className="hidden items-center gap-0.5 md:flex">
            {navIcons.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={`touch-target relative flex items-center justify-center rounded-xl px-2.5 transition-colors ${
                    active ? "text-primary" : "text-on-surface-muted hover:text-on-surface"
                  }`}
                >
                  <Icon
                    name={item.icon}
                    filled={active && item.icon === "dynamic_feed"}
                  />
                  {item.icon === "notifications" && <NotificationUnreadCount />}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="luoGhost"
              size="icon"
              aria-label="Search people"
              aria-expanded={mobileSearchOpen}
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="touch-target sm:hidden"
            >
              <Icon name="search" className="text-xl" />
            </Button>
            <ComposeLink className="hidden rounded-full bg-primary px-3 py-2 text-sm font-bold text-on-primary sm:inline-flex sm:px-4 sm:py-2">
              Post
            </ComposeLink>
            <ThemeToggle />
            <UserButton
              appearance={{
                elements: { avatarBox: "h-8 w-8 sm:h-9 sm:w-9" },
              }}
            />
            <span className="font-body hidden max-w-[100px] truncate text-sm font-medium text-on-surface lg:block xl:max-w-[120px]">
              {displayName}
            </span>
          </div>
        </div>

        {mobileSearchOpen && (
          <div className="relative border-t border-outline-soft pb-3 sm:hidden">
            <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-3">
              <Icon name="search" className="shrink-0 text-lg text-on-surface-muted" />
              <Input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Search people"
                className="h-auto min-h-0 flex-1 border-0 bg-transparent px-0 py-0 text-base shadow-none ring-0 placeholder:text-on-surface-dim focus-visible:ring-0"
              />
              <Button
                type="button"
                variant="luoGhost"
                size="icon-sm"
                aria-label="Close search"
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchQuery("");
                }}
                className="touch-target shrink-0"
              >
                <Icon name="close" />
              </Button>
            </div>
            <SearchResults className="relative mt-2" />
          </div>
        )}
      </div>
    </header>
  );
}
