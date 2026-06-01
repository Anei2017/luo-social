import Link from "next/link";
import { LandingBackdrop } from "@/components/luo/landing-backdrop";
import { LandingHeroVisual } from "@/components/luo/landing-hero-visual";
import { LandingAuthButtons, LandingHeroCta } from "@/components/luo/landing-auth";
import { LuoLogo } from "@/components/luo/logo";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <LandingBackdrop />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <LuoLogo size="lg" href="/" />
        <div className="flex items-center gap-3">
          <LandingAuthButtons />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-16 lg:pb-20">
        <section className="grid items-center gap-10 py-8 lg:grid-cols-2 lg:gap-14 lg:py-10">
          <div className="flex flex-col justify-center lg:py-8">
            <p className="text-sm font-medium text-primary">Social platform for creators</p>
            <h1 className="mt-4 text-5xl leading-[1.05] font-extrabold tracking-tight text-on-surface md:text-6xl lg:text-[3.5rem]">
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
            <div className="mt-8 flex flex-wrap gap-4">
              <LandingHeroCta />
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-2 rounded-full border border-outline bg-surface/80 px-8 py-4 text-sm font-semibold text-on-surface backdrop-blur-sm transition-colors hover:bg-surface-elevated"
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
