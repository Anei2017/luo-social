import Link from "next/link";
import { COMMUNITY_LINKS } from "@/lib/community-sections";
import { Icon } from "./icon";

/** Sidebar community shortcuts — same card-dark styling as left panel */
export function CommunityLinksPanel() {
  return (
    <div className="card-dark p-5">
      <h3 className="font-body mb-3 text-sm font-bold text-on-surface">
        Luo community
      </h3>
      <ul className="space-y-2">
        {COMMUNITY_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-on-surface-muted transition-colors hover:bg-surface-elevated hover:text-primary"
            >
              <Icon name={link.icon} className="text-lg text-primary" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
