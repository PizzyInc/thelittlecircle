import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistrar from "@/components/app/ServiceWorkerRegistrar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "The Little Circle - Your companion that tells you what's real",
  description:
    "A little floating circle on all your devices. Tap it to know if what you're seeing is AI or not. Detects AI-generated images, video, text, audio, and live calls instantly.",
  keywords: ["AI detection", "deepfake detector", "AI content", "fake video", "AI generated", "The Little Circle"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Circle",
    startupImage: [
      // iPhone SE (2nd/3rd gen)
      { url: "/splash-iphone-se.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      // iPhone 8 / 7 / 6s
      { url: "/splash-iphone-8.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      // iPhone 8 Plus / 7 Plus
      { url: "/splash-iphone-8-plus.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone X / XS / 11 Pro
      { url: "/splash-iphone-x.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone XR / 11
      { url: "/splash-iphone-xr.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      // iPhone XS Max / 11 Pro Max
      { url: "/splash-iphone-xs-max.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone 12 mini / 13 mini
      { url: "/splash-iphone-12-mini.png", media: "(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone 12 / 12 Pro / 13 / 13 Pro
      { url: "/splash-iphone-12.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone 12 Pro Max / 13 Pro Max
      { url: "/splash-iphone-12-pro-max.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone 14 Pro / 15 Pro
      { url: "/splash-iphone-14-pro.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPhone 14 Pro Max / 15 Pro Max
      { url: "/splash-iphone-14-pro-max.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      // iPad (9th/10th gen)
      { url: "/splash-ipad.png", media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      // iPad Pro 10.5" / iPad Air
      { url: "/splash-ipad-pro-10.png", media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      // iPad Pro 11"
      { url: "/splash-ipad-pro-11.png", media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      // iPad Pro 12.9"
      { url: "/splash-ipad-pro-12.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    ],
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
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
      <body>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
