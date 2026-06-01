"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps } from "react";

type ComposeLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href?: string;
};

/** Opens compose without duplicating #compose in the URL */
export function ComposeLink({ onClick, children, ...props }: ComposeLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();

    if (pathname === "/feed") {
      window.history.replaceState(null, "", "/feed#compose");
      document
        .getElementById("compose")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push("/feed#compose");
  }

  return (
    <Link href="/feed#compose" onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
