import { Lexend, Atkinson_Hyperlegible } from "next/font/google";
import localFont from "next/font/local";

// next/font downloads Google fonts at BUILD time and self-hosts them from
// your own domain - no runtime request to fonts.googleapis.com, no
// layout shift, and it works with static export.
export const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

// OpenDyslexic isn't on Google Fonts, so it's self-hosted directly from
// the files in app/fonts/ (downloaded from the font's official GitHub
// repo, SIL Open Font License - see THIRD_PARTY_LICENSES/).
export const openDyslexic = localFont({
  src: [
    { path: "../app/fonts/OpenDyslexic-Regular.woff2", weight: "400", style: "normal" },
    { path: "../app/fonts/OpenDyslexic-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-opendyslexic",
  display: "swap",
});

// Every font available in the reading settings, keyed the same way as
// FONT_OPTIONS in context/ReadingSettingsContext.jsx. Verdana is a system
// font so it needs no loader - just reference it directly by name.
export const FONT_FAMILY_MAP = {
  lexend: "var(--font-lexend)",
  atkinson: "var(--font-atkinson)",
  opendyslexic: "var(--font-opendyslexic)",
  verdana: "Verdana, sans-serif",
};

// Combine into one string of class names to apply on <html> or <body> so
// every CSS variable is available everywhere, regardless of which font is
// active in settings.
export const fontVariables = [
  lexend.variable,
  atkinson.variable,
  openDyslexic.variable,
].join(" ");
