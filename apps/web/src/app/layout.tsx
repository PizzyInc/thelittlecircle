import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Little Circle - Your companion that tells you what's real",
  description:
    "A little floating circle on all your devices. Tap it to know if what you're seeing is AI or not. Detects AI-generated images, video, text, audio, and live calls instantly.",
  keywords: ["AI detection", "deepfake detector", "AI content", "fake video", "AI generated", "The Little Circle"],
  openGraph: {
    title: "The Little Circle",
    description: "Your companion that tells you what's real.",
    siteName: "The Little Circle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Little Circle",
    description: "Your companion that tells you what's real.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
