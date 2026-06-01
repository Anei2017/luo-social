import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { ConvexRoot } from "@/components/providers/convex-root";
import { AppProviders } from "@/components/providers/app-providers";
import { luoPalette } from "@/lib/theme";
import "./globals.css";
import { cn } from "@/lib/utils";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: luoPalette.light.background },
    { media: "(prefers-color-scheme: dark)", color: luoPalette.dark.background },
  ],
};

export const metadata: Metadata = {
  title: "LUO SOCIAL",
  description:
    "A modern African community social network — connect, share, and grow together.",
  applicationName: "LUO SOCIAL",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LUO SOCIAL",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", dmSans.variable, bricolage.variable)}
    >
      <body className="min-h-screen-safe overflow-x-hidden antialiased font-body">
        <AppProviders>
          <ConvexRoot>{children}</ConvexRoot>
        </AppProviders>
      </body>
    </html>
  );
}
