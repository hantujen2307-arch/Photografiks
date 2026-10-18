import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FCFAF6",
};

export const metadata: Metadata = {
  title: {
    template: "%s | MOMEN.POTRAIT — Moment Grads Palembang",
    default: "MOMEN.POTRAIT — Every Moment Deserves to Be Remembered.",
  },
  description:
    "MOMEN.POTRAIT bersama Moment Grads Palembang menghadirkan layanan fotografi wisuda outdoor, personal portrait, couple, family, dan group photography di Palembang–Indralaya, Sumatera Selatan. Abadikan momen wisuda dan cerita berhargamu dalam potret yang estetik, natural, dan penuh kenangan.",
  keywords: [
    "fotografi wisuda palembang",
    "moment grads palembang",
    "momen potrait",
    "foto wisuda unsri",
    "fotografer indralaya",
    "wisuda outdoor palembang",
    "portrait photography palembang",
    "foto wisuda couple",
    "foto wisuda keluarga",
  ],
  authors: [{ name: "MOMEN.POTRAIT • Moment Grads Palembang" }],
};

import MobileBottomNav from "@/components/common/MobileBottomNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${jakarta.variable} scroll-smooth scroll-pt-24`}
    >
      <body className="min-h-screen flex flex-col bg-[#FCFAF6] text-[#161514] selection:bg-[#161514] selection:text-[#FCFAF6] pb-28 md:pb-0 antialiased overflow-x-hidden">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
