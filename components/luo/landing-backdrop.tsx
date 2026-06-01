import Image from "next/image";

const LANDING_WILDLIFE = "/images/landing-wildlife-hero.png";

/** Wildlife art in the page background — themed to match LUO SOCIAL */
export function LandingBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src={LANDING_WILDLIFE}
        alt=""
        fill
        className="landing-wildlife-themed object-cover object-[center_45%] opacity-[0.2] sm:opacity-[0.24] lg:object-[65%_center] lg:opacity-[0.28]"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-background/45 mix-blend-multiply" />
      <div className="absolute inset-0 bg-primary/6 mix-blend-soft-light" />
      <div className="absolute inset-0 bg-gradient-to-r from-background from-0% via-background/90 to-background/50 lg:via-background/72 lg:to-background/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/5" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />

      <div className="absolute top-1/3 right-[8%] h-72 w-72 rounded-full bg-primary/12 blur-[100px]" />
      <div className="absolute bottom-1/4 left-[8%] h-56 w-56 rounded-full bg-primary/6 blur-[80px]" />
    </div>
  );
}
