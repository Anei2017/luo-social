"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/lib/theme";

type ThemeToggleProps = {
  variant?: "icon" | "menu";
  className?: string;
};

/** Sun / Moon theme switcher — light, dark, and system (persisted via next-themes). */
export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function select(mode: ThemeMode) {
    setTheme(mode);
  }

  const triggerClass =
    variant === "menu"
      ? cn(
          "touch-target inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-on-surface-muted transition hover:bg-surface-elevated hover:text-on-surface",
          className,
        )
      : cn(
          "touch-target inline-flex size-10 items-center justify-center rounded-full text-on-surface-muted transition hover:bg-surface-elevated hover:text-on-surface",
          className,
        );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Change theme"
        className={triggerClass}
      >
        {mounted ? (
          isDark ? (
            <Sun
              className={cn(
                "size-5 text-amber-400",
                variant === "menu" && "size-4",
              )}
            />
          ) : (
            <Moon
              className={cn(
                "size-5 text-amber-700",
                variant === "menu" && "size-4",
              )}
            />
          )
        ) : (
          <Sun className="size-5 opacity-40" />
        )}
        {variant === "menu" ? <span>Theme</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <ThemeMenuItems active={theme} onSelect={select} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThemeMenuItems({
  active,
  onSelect,
}: {
  active?: string;
  onSelect: (mode: ThemeMode) => void;
}) {
  const items: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { mode: "light", label: "Light", Icon: Sun },
    { mode: "dark", label: "Dark", Icon: Moon },
    { mode: "system", label: "System", Icon: Monitor },
  ];

  return (
    <>
      {items.map(({ mode, label, Icon }) => (
        <DropdownMenuItem
          key={mode}
          onClick={() => onSelect(mode)}
          className={cn(
            "gap-2",
            active === mode && "bg-accent text-accent-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </DropdownMenuItem>
      ))}
    </>
  );
}
