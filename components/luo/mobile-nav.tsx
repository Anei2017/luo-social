"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComposeLink } from "./compose-link";
import { FEEDS_PATH } from "@/lib/feeds-path";
import { REELS_PATH } from "@/lib/reels-path";
import { Icon } from "./icon";

const items = [
  { href: FEEDS_PATH, icon: "dynamic_feed", label: "Feeds" },
  { href: REELS_PATH, icon: "movie", label: "Reels" },
  { href: FEEDS_PATH, icon: "add_circle", label: "Post", accent: true },
  { href: "/messages", icon: "chat", label: "Chat" },
  { href: "/profile", icon: "person", label: "Profile" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-soft bg-surface/95 px-safe pb-safe backdrop-blur-md md:hidden">
      <div className="flex h-[3.75rem] items-center justify-around sm:h-16">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.icon === "dynamic_feed" &&
              (pathname === FEEDS_PATH || pathname === "/feed")) ||
            (item.icon === "movie" && pathname.startsWith("/reels")) ||
            (item.icon === "chat" && pathname.startsWith("/messages")) ||
            (item.icon === "person" && pathname.startsWith("/profile"));
          if ("accent" in item && item.accent) {
            return (
              <ComposeLink
                key={item.label}
                className="flex -mt-4 h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
                aria-label="Create post"
              >
                <Icon name={item.icon} className="text-2xl" />
              </ComposeLink>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`touch-target relative flex min-w-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 ${
                active ? "text-primary" : "text-on-surface-muted"
              }`}
            >
              <Icon
                name={item.icon}
                filled={active && item.icon === "dynamic_feed"}
              />
              <span className="max-w-full truncate text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
