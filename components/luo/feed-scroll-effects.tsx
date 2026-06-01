"use client";

import { useEffect } from "react";

/** Normalizes /feed#compose#compose and scrolls to the compose box */
export function FeedScrollEffects() {
  useEffect(() => {
    const raw = window.location.hash.replace(/^#+/, "");
    if (!raw.includes("compose")) return;

    window.history.replaceState(null, "", "/feed#compose");
    const el = document.getElementById("compose");
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return null;
}
