import Link from "next/link";
import { FEEDS_PATH } from "@/lib/feeds-path";
import { Icon } from "./icon";

/** Standard page header matching existing card-dark pages */
export function CommunityPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card-dark p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-on-surface sm:text-2xl">{title}</h1>
          <p className="mt-1 text-sm text-on-surface-muted">{description}</p>
        </div>
        <Link
          href={FEEDS_PATH}
          className="flex shrink-0 items-center gap-1 rounded-full border border-outline px-3 py-1.5 text-xs font-semibold text-on-surface-muted"
        >
          <Icon name="dynamic_feed" className="text-base" />
          Feeds
        </Link>
      </div>
    </div>
  );
}
