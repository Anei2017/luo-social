import Link from "next/link";

type LuoLogoProps = {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
  variant?: "light" | "mark-only";
};

const sizes = {
  sm: { icon: 28, gap: "gap-2" },
  md: { icon: 32, gap: "gap-2.5" },
  lg: { icon: 36, gap: "gap-3" },
};

/** Abstract mark similar to the Dribbble reference */
export function LuoLogo({
  size = "md",
  showText = true,
  href = "/",
  variant = "light",
}: LuoLogoProps) {
  const s = sizes[size];

  const mark = (
    <div className={`flex items-center ${s.gap}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <path
          d="M8 32 L20 8 L32 32 Z"
          stroke={variant === "light" ? "#fff" : "#efff00"}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />
        <circle
          cx="20"
          cy="26"
          r="4"
          fill={variant === "light" ? "#efff00" : "#efff00"}
        />
      </svg>
      {showText && variant === "light" && (
        <span className="font-body text-lg font-semibold tracking-tight text-on-surface">
          LUO
        </span>
      )}
    </div>
  );

  if (!href) return mark;

  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-85">
      {mark}
    </Link>
  );
}
