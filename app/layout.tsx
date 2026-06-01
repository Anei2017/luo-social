import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { ConvexRoot } from "@/components/providers/convex-root";
import { UiProviders } from "@/components/providers/ui-providers";
import { clerkAuthAppearance } from "@/components/luo/auth-layout";
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
      <html
        lang="en"
        className={cn("dark font-sans", dmSans.variable, bricolage.variable)}
      >
        <body className="min-h-screen-safe overflow-x-hidden antialiased font-body">
          <UiProviders>
            <ConvexRoot>{children}</ConvexRoot>
          </UiProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
