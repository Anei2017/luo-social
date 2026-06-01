import { luoPalette } from "@/lib/theme";

/** Clerk UI variables aligned with LUO light / dark tokens */
export function getClerkAppearance(theme: "light" | "dark") {
  const p = theme === "light" ? luoPalette.light : luoPalette.dark;

  return {
    variables: {
      colorBackground: p.surface,
      colorInputBackground: theme === "light" ? "#F3EDE6" : "#252525",
      colorText: p.text,
      colorPrimary: p.accentOrange,
      colorTextOnPrimaryBackground: theme === "light" ? "#FFFFFF" : "#0F0F0F",
      colorNeutral: theme === "light" ? "#78716C" : "#9ca3af",
      colorWarning: p.accentOrange,
      borderRadius: "0.75rem",
    },
    elements: {
      card: "bg-surface/95 border border-outline shadow-2xl rounded-2xl backdrop-blur-md",
      headerTitle: "text-on-surface",
      headerSubtitle: "text-on-surface-muted",
      socialButtonsBlockButton:
        "bg-surface-elevated border border-outline text-on-surface hover:bg-surface-input",
      formButtonPrimary: "bg-primary text-on-primary font-bold",
      footerActionLink: "text-primary hover:text-primary/80",
      footerActionText: "text-on-surface-muted",
      formFieldLabel: "text-on-surface-muted",
      identityPreviewText: "text-on-surface",
      formResendCodeLink: "text-primary",
      alertText: "text-primary",
      badge: "bg-primary/15 text-primary border-primary/30",
    },
  } as const;
}
