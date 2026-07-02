import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Space Shield | Real-Time Space Threat Monitoring",
  description: "Monitor asteroids, fireballs, and solar flares in real-time. Space Shield protects Earth from cosmic threats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col scanlines">{children}<Analytics /></body>
    </html>
  );
}
