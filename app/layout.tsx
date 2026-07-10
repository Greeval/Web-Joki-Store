import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Greeval Store – Jasa Joki Game Multi-Platform",
  description: "Layanan joki game profesional untuk Genshin Impact, Honkai Star Rail, Wuthering Waves, dan game lainnya. Rawat akun, farming material, build character, explore map.",
  keywords: "joki game, greeval, genshin impact, honkai star rail, farming material, rawat akun",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=Archivo+Narrow:ital,wght@0,400..700;1,400..700&family=Inter:wght@400;500;600;700&family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
