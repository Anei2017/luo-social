import Image from "next/image";

/**
 * Sign-in: community photo + hippo
 * Sign-up: Dribbble mask only — no other background images
 */
const AUTH_BG_IMAGE =
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2400&q=85";

const AUTH_MASK_IMAGE =
  "https://cdn.dribbble.com/userupload/30243730/file/original-be97b17fc2f82a2642063b4fef1c1c53.jpg?resize=752x&vertical=center";

const HIPPO_SIGN_IN = "/images/hippo-auth.jpg";

export type AuthBackdropVariant = "sign-in" | "sign-up";

type AuthBackdropProps = {
  variant?: AuthBackdropVariant;
};

export function AuthBackdrop({ variant = "sign-in" }: AuthBackdropProps) {
  if (variant === "sign-up") {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden bg-background" aria-hidden>
        <Image
          src={AUTH_MASK_IMAGE}
          alt=""
          fill
          priority
          className="auth-mask-themed object-contain object-center opacity-[0.52] sm:opacity-[0.58]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/45 to-background/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-background/15" />
        <div className="absolute inset-0 bg-primary/8 mix-blend-soft-light" />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Image
        src={AUTH_BG_IMAGE}
        alt=""
        fill
        priority
        className="scale-105 object-cover object-[center_20%] opacity-70"
        sizes="100vw"
      />

      <div className="absolute inset-0 bg-background/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-background from-25% via-background/85 to-background/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-background" />

      <div
        className="absolute inset-x-0 bottom-0 h-[min(86vh,760px)]"
        style={{
          maskImage: "linear-gradient(to top, black 6%, black 52%, transparent 88%)",
          WebkitMaskImage: "linear-gradient(to top, black 6%, black 52%, transparent 88%)",
        }}
      >
        <Image
          src={HIPPO_SIGN_IN}
          alt=""
          fill
          priority
          className="object-cover object-[center_68%] saturate-[0.88] contrast-[1.08] brightness-[0.64]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/65 via-transparent to-background/30" />
        <div className="absolute inset-0 mix-blend-multiply bg-background/12" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/8 via-transparent to-transparent" />
      </div>

      <svg
        className="absolute -top-24 -left-24 h-[520px] w-[520px] text-primary/20"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="2" />
        <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="2" opacity="0.7" />
        <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="2" opacity="0.5" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x2 = 200 + Math.cos(rad) * 180;
          const y2 = 200 + Math.sin(rad) * 180;
          return (
            <line
              key={deg}
              x1="200"
              y1="200"
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.35"
            />
          );
        })}
      </svg>

      <div className="absolute top-1/3 right-[8%] hidden h-72 w-72 rounded-full bg-primary/12 blur-[100px] lg:block" />
    </div>
  );
}
