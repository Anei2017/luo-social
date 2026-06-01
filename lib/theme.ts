/**
 * Luo Social — theme tokens & persistence key.
 * CSS variables in globals.css map these values for light / .dark.
 */

export const THEME_STORAGE_KEY = "luo-social-theme";

export type ThemeMode = "light" | "dark" | "system";

/** Warm Luo palette (reference for docs & Clerk) */
export const luoPalette = {
  light: {
    background: "#F8F4F0",
    surface: "#FFFFFF",
    text: "#1F1F1F",
    border: "#E8DFD4",
    accentOrange: "#F97316",
    accentGreen: "#15803D",
    earthBrown: "#92400E",
  },
  dark: {
    background: "#0F0F0F",
    surface: "#1A1A1A",
    text: "#FAFAF9",
    border: "#2E2A26",
    accentOrange: "#F97316",
    accentGreen: "#4ADE80",
    earthBrown: "#D97706",
  },
} as const;
