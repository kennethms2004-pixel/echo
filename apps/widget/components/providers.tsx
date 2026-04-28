"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Provider as JotaiProvider } from "jotai";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "NEXT_PUBLIC_CONVEX_URL is required before creating ConvexReactClient."
  );
}

const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <JotaiProvider>{children}</JotaiProvider>
    </ConvexProvider>
  );
}
