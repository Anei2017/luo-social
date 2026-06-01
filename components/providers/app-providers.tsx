"use client";

import { useMemo } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { useTheme } from "next-themes";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { UiProviders } from "@/components/providers/ui-providers";
import { getClerkAppearance } from "@/lib/clerk-appearance";
import { ThemeColorMeta } from "@/components/theme-color-meta";
import { ThemeTransition } from "@/components/theme-transition";

function ClerkWithTheme({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const appearance = useMemo(
    () => getClerkAppearance(resolvedTheme === "light" ? "light" : "dark"),
    [resolvedTheme],
  );

  return (
    <ClerkProvider appearance={appearance} ui={ui}>
      <ThemeColorMeta />
      <ThemeTransition />
      <UiProviders>{children}</UiProviders>
    </ClerkProvider>
  );
}

/** Theme + Clerk + React Query + tooltips */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ClerkWithTheme>{children}</ClerkWithTheme>
    </ThemeProvider>
  );
}
