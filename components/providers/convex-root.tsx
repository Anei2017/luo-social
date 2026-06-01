import { ConvexClientProvider } from "./convex-client-provider";

/** Server wrapper — reads Convex URL at runtime on Vercel (not only at client build time) */
export function ConvexRoot({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider convexUrl={process.env.NEXT_PUBLIC_CONVEX_URL}>
      {children}
    </ConvexClientProvider>
  );
}
