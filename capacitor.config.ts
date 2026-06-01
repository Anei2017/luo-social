import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell loads your live Vercel site — same UI, theme, Clerk, and Convex.
 * Change CAPACITOR_SERVER_URL to a preview URL for testing.
 */
const serverUrl =
  process.env.CAPACITOR_SERVER_URL ?? "https://luo-social.vercel.app";

const config: CapacitorConfig = {
  appId: "com.luosocial.app",
  appName: "LUO SOCIAL",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#121212",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#121212",
    },
  },
};

export default config;
