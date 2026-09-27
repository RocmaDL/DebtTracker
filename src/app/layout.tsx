import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistPixelSquare } from "geist/font/pixel";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DebtTracker · Chaque burger se paie en minutes",
    template: "%s · DebtTracker",
  },
  description:
    "Projet vitrine : une app qui convertit vos écarts fast-food en minutes de sport à rembourser, et planifie vos prochaines séances.",
  applicationName: "DebtTracker",
  authors: [{ name: "Rocma Dimba-Lau" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "DebtTracker",
    title: "DebtTracker · Chaque burger se paie en minutes",
    description: "Transformez vos écarts fast-food en minutes de sport, et remboursez-les séance après séance.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#050607",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} h-full antialiased`}
    >
      <body className="grain min-h-full">{children}</body>
    </html>
  );
}
