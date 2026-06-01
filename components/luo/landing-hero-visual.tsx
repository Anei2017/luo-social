import Image from "next/image";
import { Icon } from "./icon";

const LANDING_WILDLIFE = "/images/landing-wildlife-hero.png";

const FEATURES = [
  { icon: "palette", title: "Creator-first feed", text: "Stories, posts, hire-me CTAs." },
  { icon: "groups", title: "Communities & skills", text: "Find your people across the diaspora." },
  { icon: "payments", title: "Activity & tips", text: "Track support and collaborations." },
] as const;

export function LandingHeroVisual() {
  return (
    <div className="relative flex w-full flex-col items-center lg:items-end">
      <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[1.25rem] border border-primary/20 bg-surface shadow-[0_0_48px_rgba(239,255,0,0.1)] sm:max-w-md">
        <Image
          src={LANDING_WILDLIFE}
          alt="African wildlife — lion, giraffe, rhino, and savanna"
          fill
          priority
          className="landing-wildlife-themed object-contain object-center p-3"
          sizes="(max-width: 640px) 90vw, 28rem"
        />

        <div className="absolute inset-0 rounded-[1.25rem] bg-background/25 mix-blend-multiply" />
        <div className="absolute inset-0 rounded-[1.25rem] bg-primary/10 mix-blend-soft-light" />
        <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-t from-background/80 via-transparent to-background/15" />
        <div className="absolute inset-0 rounded-[1.25rem] ring-1 ring-inset ring-primary/15" />

        <div className="absolute -right-6 bottom-1/4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

        <p className="absolute top-3 right-3 rounded-full border border-primary/30 bg-background/70 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase backdrop-blur-sm">
          Africa · Community
        </p>
      </div>

      <ul className="mt-5 w-full max-w-md space-y-3 sm:max-w-md">
        {FEATURES.map((item) => (
          <li
            key={item.title}
            className="flex gap-4 rounded-2xl border border-outline bg-surface/95 p-4"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Icon name={item.icon} className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">{item.title}</h3>
              <p className="text-sm text-on-surface-muted">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
