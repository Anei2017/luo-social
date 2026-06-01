"use client";

import { useEffect } from "react";
import { FEEDS_PATH } from "@/lib/feeds-path";

function isFeedsPath(pathname: string) {
  return pathname === FEEDS_PATH || pathname === "/feed";
}

/** Scroll to compose or a post from URL hash on feeds pages */
export function FeedScrollEffects() {
  useEffect(() => {
    if (!isFeedsPath(window.location.pathname)) return;

    const raw = window.location.hash.replace(/^#+/, "");
    if (!raw) return;

    const base = window.location.pathname;
    const search = window.location.search;

    if (raw.includes("compose")) {
      window.history.replaceState(null, "", `${base}${search}#compose`);
      requestAnimationFrame(() => {
        document
          .getElementById("compose")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    const postMatch = raw.match(/^post-(.+)$/);
    if (postMatch) {
      requestAnimationFrame(() => {
        document
          .getElementById(`post-${postMatch[1]}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, []);

  return null;
}
