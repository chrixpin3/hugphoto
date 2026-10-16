import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HUG Photos — Capturing Moments, Creating Memories",
    template: "%s · HUG Photos",
  },
  description:
    "HUG Photos is a professional photography studio creating timeless portraits, weddings, events, lifestyle and commercial imagery.",
  keywords: [
    "photography",
    "portrait photographer",
    "wedding photography",
    "event photography",
    "commercial photography",
    "HUG Photos",
  ],
  openGraph: {
    title: "HUG Photos — Capturing Moments, Creating Memories",
    description: "Professional photography that tells your story.",
    type: "website",
    url: siteUrl,
    siteName: "HUG Photos",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-white font-sans text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
