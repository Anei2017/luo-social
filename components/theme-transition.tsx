"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/** Brief transition class on <html> when theme changes for smooth color crossfade */
export function ThemeTransition() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    const id = window.setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 400);
    return () => window.clearTimeout(id);
  }, [resolvedTheme]);

  return null;
}
