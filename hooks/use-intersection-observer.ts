"use client";

import { useEffect, useRef, useState } from "react";

type UseIntersectionObserverOptions = {
  /** Root margin passed to IntersectionObserver (e.g. "200px" to prefetch early) */
  rootMargin?: string;
  /** Threshold 0–1 */
  threshold?: number;
  /** Disable observation */
  disabled?: boolean;
};

/**
 * Returns a ref to attach to a sentinel element and whether it is in view.
 */
export function useIntersectionObserver({
  rootMargin = "200px",
  threshold = 0,
  disabled = false,
}: UseIntersectionObserverOptions = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (disabled) {
      setIsIntersecting(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { rootMargin, threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, disabled]);

  return { ref, isIntersecting };
}
