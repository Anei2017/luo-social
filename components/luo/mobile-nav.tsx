"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./icon";
import { NotificationUnreadDot } from "./notification-unread";

const items = [
  { href: "/feed", icon: "home", label: "Home" },
  { href: "/messages", icon: "chat", label: "Chat" },
  { href: "/feed#compose", icon: "add_circle", label: "Post", accent: true },
  { href: "/notifications", icon: "notifications", label: "Alerts" },
  { href: "/profile", icon: "person", label: "Profile" },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-soft bg-surface px-2 pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.icon === "home" && pathname === "/feed") ||
            (item.icon === "chat" && pathname.startsWith("/messages")) ||
            (item.icon === "person" && pathname.startsWith("/profile"));
          if ("accent" in item && item.accent) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex -mt-4 h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg"
                aria-label="Create post"
              >
                <Icon name={item.icon} className="text-2xl" />
              </Link>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 ${
                active ? "text-primary" : "text-on-surface-muted"
              }`}
            >
              <Icon name={item.icon} filled={active && item.icon === "home"} />
              {item.icon === "notifications" && <NotificationUnreadDot />}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
