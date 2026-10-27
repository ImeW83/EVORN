import { Bodoni_Moda, Oswald, Pinyon_Script } from "next/font/google";

// Headline faces for hero slides, self-hosted by next/font. Applied as CSS variables on the hero only.
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-hero-script" });
const serif = Bodoni_Moda({ subsets: ["latin"], weight: "500", display: "swap", variable: "--font-hero-serif" });
const bold = Oswald({ subsets: ["latin"], weight: "600", display: "swap", variable: "--font-hero-bold" });

export const heroFonts = `${script.variable} ${serif.variable} ${bold.variable}`;
