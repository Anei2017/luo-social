"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComposeLink } from "./compose-link";
import { Icon } from "./icon";
import { NotificationUnreadDot } from "./notification-unread";

const items = [
  { href: "/feed", icon: "home", label: "Home" },
  { href: "/messages", icon: "chat", label: "Chat" },
  { href: "/feed", icon: "add_circle", label: "Post", accent: true },
  { href: "/notifications", icon: "notifications", label: "Alerts" },
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
            (item.icon === "home" && pathname === "/feed") ||
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
              <Icon name={item.icon} filled={active && item.icon === "home"} />
              {item.icon === "notifications" && <NotificationUnreadDot />}
              <span className="max-w-full truncate text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
