import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./landing.css";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "DukaanDost — Apni dukaan, apni kamai",
  description:
    "DukaanDost gives home businesses in Pakistan a shop link, order tracker and weekly earnings summary in two minutes. No tech skills needed.",
};

export const viewport: Viewport = {
  themeColor: "#590ec5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <StoreProvider>{children}</StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
