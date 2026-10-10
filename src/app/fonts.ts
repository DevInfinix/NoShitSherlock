import { Caveat, Special_Elite } from "next/font/google";
import localFont from "next/font/local";

export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  display: "swap",
});

export const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-stamp",
  display: "swap",
});

export const fontValmist = localFont({
  src: [
    {
      path: "./fonts/tbj-valmist-font/TBJValmistDemo-Regular-BF69b16dd86c9d9.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/tbj-valmist-font/TBJValmistDemo-SemiBold-BF69b16dd877c38.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/tbj-valmist-font/TBJValmistDemo-Bold-BF69b16dd7d6f65.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/tbj-valmist-font/TBJValmistDemo-ExtraBold-BF69b16dd7e2e36.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-valmist",
  display: "swap",
});

export const fontCharlea = localFont({
  src: "./fonts/charlea-demo-semi-bold-italic/CharleaDemo-SemiBoldItalic.ttf",
  weight: "600",
  style: "italic",
  variable: "--font-charlea",
  display: "swap",
});

export const fontGothica = localFont({
  src: "./fonts/gothica-modern-gm-font/GothicaModernGm-Regular.otf",
  weight: "400",
  style: "normal",
  variable: "--font-gothica",
  display: "swap",
});

export const fontHarmera = localFont({
  src: "./fonts/harmera-font/Harmera-BF6a327b7b7bd9d.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-harmera",
  display: "swap",
});

export const fontGaramond = localFont({
  src: "./fonts/itc-garamond-std-light-condensed-italic/itc-garamond-std-light-condensed-italic.otf",
  weight: "300",
  style: "italic",
  variable: "--font-garamond",
  display: "swap",
});

export const fontSelnora = localFont({
  src: [
    {
      path: "./fonts/selnora-font-family/Selnora-ThinCondensed.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/selnora-font-family/Selnora-ThinCondensedSlant.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "./fonts/selnora-font-family/SelnoraSoft-ThinCondensed.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/selnora-font-family/SelnoraSoft-ThinCondIta.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-selnora",
  display: "swap",
});
