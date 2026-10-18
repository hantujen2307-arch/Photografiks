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
    template: "%s | MOMEN.POTRAIT — Studio & Portrait Photography",
    default: "MOMEN.POTRAIT — Every Moment Deserves to Be Remembered",
  },
  description:
    "MOMEN.POTRAIT adalah studio fotografi profesional dengan pendekatan editorial dan intim. Melayani portrait pribadi, couple, graduation, family, dan commercial session.",
  keywords: [
    "fotografi studio jakarta",
    "momen potrait",
    "portrait photography",
    "foto wisuda jakarta",
    "couple photoshoot",
    "editorial photography",
    "jasa foto profesional",
  ],
  authors: [{ name: "MOMEN.POTRAIT Studio" }],
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
