import type { MetadataRoute } from "next";

/** Installable PWA — same web app, no design changes */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LUO SOCIAL",
    short_name: "LUO SOCIAL",
    description:
      "A modern African community social network — connect, share, and grow together.",
    start_url: "/",
    display: "standalone",
    background_color: "#121212",
    theme_color: "#121212",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
