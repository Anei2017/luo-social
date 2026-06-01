"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { FEEDS_PATH } from "@/lib/feeds-path";

type ComposeLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
};

function isFeedsPath(pathname: string) {
  return pathname === FEEDS_PATH || pathname === "/feed";
}

/** Opens compose without duplicating #compose in the URL */
export function ComposeLink({ onClick, children, ...props }: ComposeLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();

    if (isFeedsPath(pathname)) {
      const base = pathname === "/feed" ? FEEDS_PATH : pathname;
      window.history.replaceState(null, "", `${base}#compose`);
      document
        .getElementById("compose")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push(`${FEEDS_PATH}#compose`);
  }

  return (
    <Link href={`${FEEDS_PATH}#compose`} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
