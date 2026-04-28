import type { Metadata } from "next";
import "@workspace/ui/globals.css";

import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Echo Tutorial Widget",
  description: "Widget app for the Echo tutorial monorepo"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* TODO: confirm whether min-h-screen and min-w-screen are needed when rendered inside an iframe */}
      <body className="min-h-screen min-w-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
