import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  caveat,
  fontCharlea,
  fontGaramond,
  fontGothica,
  fontHarmera,
  fontSelnora,
  fontValmist,
  specialElite,
} from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://noshitsherlock.thesamstudios.in",
  ),
  title: "NoShitSherlock | Detective Web Game",
  description: "An open-source noir detective web game. Crack the case before time runs out.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "NoShitSherlock | Detective Web Game",
    description: "An open-source noir detective web game. Crack the case before time runs out.",
    url: "https://noshitsherlock.thesamstudios.in",
    siteName: "NoShitSherlock",
    images: [
      {
        url: "https://noshitsherlock.thesamstudios.in/og-banner.jpg",
        secureUrl: "https://noshitsherlock.thesamstudios.in/og-banner.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "NoShitSherlock - Detective Web Game",
      },
      {
        url: "https://noshitsherlock.thesamstudios.in/og-banner.png",
        secureUrl: "https://noshitsherlock.thesamstudios.in/og-banner.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "NoShitSherlock - Detective Web Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoShitSherlock | Detective Web Game",
    description: "An open-source noir detective web game. Crack the case before time runs out.",
    images: ["https://noshitsherlock.thesamstudios.in/og-banner.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fontValmist.variable} ${fontCharlea.variable} ${fontGothica.variable} ${fontHarmera.variable} ${fontGaramond.variable} ${fontSelnora.variable} ${caveat.variable} ${specialElite.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
