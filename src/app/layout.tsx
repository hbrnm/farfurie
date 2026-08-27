import type { Metadata, Viewport } from "next";
import { Fraunces, Figtree } from "next/font/google";
import { HydrateStore } from "@/components/HydrateStore";
import { PwaRegister } from "@/components/PwaRegister";
import { ThemeSync } from "@/components/ThemeSync";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Farfurie — Farfuria ta, înțeleasă",
  description:
    "Tracking de calorii și rețete pentru România: Umple golul, Oala comună, Calendarul pieței, Mod Sărbători. RO + EN.",
  applicationName: "Farfurie",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Farfurie",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.svg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1b5e45",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <HydrateStore>
          <ThemeSync />
          {children}
          <PwaRegister />
        </HydrateStore>
      </body>
    </html>
  );
}
