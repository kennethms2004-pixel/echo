import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "@workspace/ui/globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Echo Tutorial Web",
  description: "Web app for the Echo tutorial monorepo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
