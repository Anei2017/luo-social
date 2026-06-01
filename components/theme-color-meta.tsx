"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { luoPalette } from "@/lib/theme";

/** Updates mobile browser theme-color when mode changes */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const color =
      resolvedTheme === "light"
        ? luoPalette.light.background
        : luoPalette.dark.background;
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  }, [resolvedTheme]);

  return null;
}
