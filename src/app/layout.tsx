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
  title: "NoShitSherlock | Detective Web Game",
  description: "An open-source noir detective web game. Crack the case before time runs out.",
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
