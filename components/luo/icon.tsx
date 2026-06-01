import type { LucideIcon } from "lucide-react";
import { HelpCircle } from "lucide-react";
import { ICON_MAP } from "@/lib/icon-map";
import { cn } from "@/lib/utils";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

export function Icon({ name, className = "", filled }: IconProps) {
  const Lucide: LucideIcon = ICON_MAP[name] ?? HelpCircle;

  return (
    <Lucide
      className={cn(
        "inline-block shrink-0",
        filled && "fill-current",
        className,
      )}
      aria-hidden
    />
  );
}
