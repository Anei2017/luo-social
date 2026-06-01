import Link from "next/link";
import { getClerkAppearance } from "@/lib/clerk-appearance";
import { AuthBackdrop, type AuthBackdropVariant } from "./auth-backdrop";
import { LuoLogo } from "./logo";

type AuthLayoutProps = {
  children: React.ReactNode;
  tagline?: string;
  backdropVariant?: AuthBackdropVariant;
};

const PHOTO_CREDITS: Record<
  AuthBackdropVariant,
  { label: string; href: string; photographer: string }
> = {
  "sign-in": {
    label: "hippos in water",
    href: "https://unsplash.com/photos/hippos-relax-together-in-the-water-AYkNWFUHjiM",
    photographer: "Peter Thomas",
  },
  "sign-up": {
    label: "mask art",
    href: "https://dribbble.com",
    photographer: "Dribbble",
  },
};

export function AuthLayout({
  children,
  tagline = "Connect with creators across Africa & the diaspora",
  backdropVariant = "sign-in",
}: AuthLayoutProps) {
  const animalCredit = PHOTO_CREDITS[backdropVariant];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AuthBackdrop variant={backdropVariant} />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Brand panel — visible on large screens */}
        <div className="hidden flex-1 flex-col justify-between p-10 lg:flex xl:p-14">
          <LuoLogo size="lg" href="/" />
          <div className="max-w-md">
            <p className="text-sm font-semibold tracking-[0.2em] text-primary uppercase">
              LUO SOCIAL
            </p>
            <h1 className="mt-4 text-4xl leading-tight font-extrabold tracking-tight text-on-surface xl:text-5xl">
              Your community.
              <br />
              Your craft.
              <br />
              <span className="text-primary">Your story.</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-muted">
              {tagline}
            </p>
          </div>
          <p className="text-xs text-on-surface-dim">
            Photos: community ({" "}
            <Link
              href="https://unsplash.com/license"
              className="underline hover:text-on-surface-muted"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsplash
            </Link>
            ), {animalCredit.label} ({" "}
            <Link
              href={animalCredit.href}
              className="underline hover:text-on-surface-muted"
              target="_blank"
              rel="noopener noreferrer"
            >
              {animalCredit.photographer} / Unsplash
            </Link>
            )
          </p>
        </div>

        {/* Auth card column */}
        <div
          className={`flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10 lg:max-w-xl ${
            backdropVariant === "sign-up"
              ? "lg:bg-background/20 lg:backdrop-blur-[1px]"
              : "lg:bg-background/40 lg:backdrop-blur-sm"
          }`}
        >
          <div className="mb-8 lg:hidden">
            <LuoLogo size="lg" href="/" />
          </div>
          <div className="auth-clerk-root w-full max-w-[420px] min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Prefer ClerkProvider in AppProviders; kept for pages that pass appearance explicitly */
export const clerkAuthAppearance = getClerkAppearance("dark");
