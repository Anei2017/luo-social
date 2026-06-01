import Link from "next/link";
import { LandingBackdrop } from "@/components/luo/landing-backdrop";
import { LandingHeroVisual } from "@/components/luo/landing-hero-visual";
import { LandingAuthButtons, LandingHeroCta } from "@/components/luo/landing-auth";
import { LuoLogo } from "@/components/luo/logo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <LandingBackdrop />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
        <LuoLogo size="lg" href="/" />
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          <LandingAuthButtons />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
        <section className="grid items-center gap-8 py-6 sm:gap-10 sm:py-8 lg:grid-cols-2 lg:gap-14 lg:py-10">
          <div className="flex flex-col justify-center lg:py-8">
            <p className="text-sm font-medium text-primary">Social platform for creators</p>
            <h1 className="mt-4 text-[2rem] leading-[1.08] font-extrabold tracking-tight text-on-surface sm:text-5xl md:text-6xl lg:text-[3.5rem]">
              Connect.
              <br />
              <span className="text-primary">Create.</span>
              <br />
              Collaborate.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-on-surface-muted">
              LUO SOCIAL — a modern community for African creators and diaspora voices.
              Share work, get hired, and grow together.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <LandingHeroCta />
              <Link
                href="/sign-in"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-outline bg-surface/80 px-8 py-4 text-sm font-semibold text-on-surface backdrop-blur-sm transition-colors hover:bg-surface-elevated active:bg-surface-elevated"
              >
                Sign in
              </Link>
            </div>
            <p className="mt-6 text-sm text-on-surface-dim">
              Google · Facebook · Email — powered by Clerk
            </p>
          </div>

          <LandingHeroVisual />
        </section>
      </main>
    </div>
  );
}
