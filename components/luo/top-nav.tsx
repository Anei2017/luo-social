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
import { Icon } from "./icon";
import { NotificationUnreadCount } from "./notification-unread";

const navIcons = [
  { href: "/feed", icon: "home", label: "Home" },
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
  const searchResults = useQuery(
    api.users.search,
    searchQuery.trim().length >= 2 ? { query: searchQuery } : "skip",
  );

  const displayName = profile?.displayName ?? clerkUser?.fullName ?? "Member";

  function goToUser(username: string) {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/profile/${username}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-outline-soft bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 lg:px-6">
        <div className="relative flex min-w-0 flex-1 items-center gap-4 lg:max-w-md">
          <LuoLogo size="sm" showText href="/feed" />
          <div className="relative hidden flex-1 sm:block">
            <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5">
              <Icon name="search" className="text-lg text-on-surface-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search people"
                className="font-body w-full bg-transparent text-sm text-on-surface placeholder:text-on-surface-dim focus:outline-none"
              />
            </div>
            {searchOpen && searchQuery.trim().length >= 2 && searchResults && (
              <div className="absolute top-full right-0 left-0 z-50 mt-2 max-h-64 overflow-auto rounded-xl border border-outline bg-surface py-2 shadow-xl">
                {searchResults.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-on-surface-muted">No users found</p>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => goToUser(u.username)}
                      className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-surface-elevated"
                    >
                      <div className="relative h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={avatarUrl(u)}
                          alt=""
                          fill
                          unoptimized
                          sizes="32px"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {u.displayName}
                        </p>
                        <p className="text-xs text-on-surface-dim">@{u.username}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {navIcons.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className={`relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                  active ? "text-primary" : "text-on-surface-muted hover:text-on-surface"
                }`}
              >
                <Icon
                  name={item.icon}
                  filled={active && item.icon === "home"}
                />
                {item.icon === "notifications" && <NotificationUnreadCount />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/feed#compose"
            className="hidden rounded-full bg-primary px-4 py-2 text-sm font-bold text-on-primary sm:inline-flex"
          >
            Post
          </Link>
          <UserButton
            appearance={{
              elements: { avatarBox: "h-9 w-9" },
            }}
          />
          <span className="font-body hidden max-w-[120px] truncate text-sm font-medium text-on-surface lg:block">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
