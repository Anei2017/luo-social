import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { ConvexRoot } from "@/components/providers/convex-root";
import { clerkAuthAppearance } from "@/components/luo/auth-layout";
import "./globals.css";

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
  themeColor: "#121212",
};

export const metadata: Metadata = {
  title: "LUO SOCIAL",
  description:
    "A modern African community social network — connect, share, and grow together.",
  applicationName: "LUO SOCIAL",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
    <ClerkProvider appearance={clerkAuthAppearance} ui={ui}>
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${bricolage.variable} ${dmSans.variable} min-h-screen-safe antialiased overflow-x-hidden`}
        >
          <ConvexRoot>{children}</ConvexRoot>
        </body>
      </html>
    </ClerkProvider>
  );
}
