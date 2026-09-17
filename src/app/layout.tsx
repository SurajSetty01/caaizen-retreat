import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import { GoogleTag } from "@/components/google-tag";
import { SmoothScroll } from "@/components/smooth-scroll";
import { WhatsAppButton } from "@/components/whatsapp-button";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://caaizentheretreat.com",
  ),
  title: {
    default: "Caaizen Retreat | Gated Farmhouse Community in Bidadi",
    template: "%s | Caaizen Retreat",
  },
  description:
    "Premium gated farmhouse plots and eco-conscious cottages near Bidadi, Bengaluru, with edible gardens, resort-style amenities, and optional rental management.",
  keywords: [
    "Caaizen Retreat",
    "Bidadi farmhouse plots",
    "farm land near Bengaluru",
    "gated farmhouse community",
    "eco villas Bangalore",
  ],
  openGraph: {
    title: "Caaizen Retreat",
    description:
      "A premium gated farmhouse community near Bidadi for intentional living, edible gardens, compact cottages, and weekend retreats.",
    url: "/",
    siteName: "Caaizen Retreat",
    images: [
      {
        url: "/retreat/forest-cottage-deck.png",
        width: 2048,
        height: 1365,
        alt: "Forest cottage deck at Caaizen Retreat",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Caaizen Retreat",
    description:
      "Premium gated farmhouse plots and eco-conscious cottages near Bidadi, Bengaluru.",
    images: ["/retreat/forest-cottage-deck.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#f4f0e6] text-[#182015]">
        {/* The account-level Google Ads tag, once, on every page. Google's
            own instruction is that a second copy must never exist. */}
        <GoogleTag />
        <SmoothScroll>{children}</SmoothScroll>
        {/* Outside SmoothScroll: it is position-fixed and must not be swept
            along by Lenis's scroll transform. */}
        <WhatsAppButton />
      </body>
    </html>
  );
}
