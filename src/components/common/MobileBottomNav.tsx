"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Image as ImageIcon, Calendar, MessageCircle } from "lucide-react";
import { cn, createWhatsAppUrl } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/portfolio", label: "Galeri", icon: ImageIcon },
  { href: "/packages", label: "Paket", icon: Sparkles },
  { href: "/booking", label: "Booking", icon: Calendar, isSpecial: true },
];

export default function MobileBottomNav({
  whatsappNumber = "6285157335443",
}: {
  whatsappNumber?: string;
}) {
  const pathname = usePathname();

  // Don't show in admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const waUrl = createWhatsAppUrl(
    whatsappNumber,
    "Halo MOMEN.POTRAIT, saya ingin bertanya mengenai ketersediaan jadwal dan paket foto studio."
  );

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#FCFAF6]/95 backdrop-blur-lg border-t border-[#E8E1D5] shadow-lg px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-2 flex flex-col items-center group"
                aria-label="Pesan Sesi Foto"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95",
                    isActive
                      ? "bg-[#B8976C] text-[#161514] ring-2 ring-[#161514]"
                      : "bg-[#161514] text-[#FCFAF6] hover:bg-[#2A2926]"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] uppercase tracking-wider font-semibold mt-1",
                    isActive ? "text-[#161514] font-bold" : "text-[#846F54]"
                  )}
                >
                  Booking
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95",
                isActive
                  ? "text-[#161514] font-semibold"
                  : "text-[#846F54] hover:text-[#161514]"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.2]" : "stroke-[1.75]")} />
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-[#161514] absolute -bottom-1 left-1/2 -translate-x-1/2" />
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wider font-medium mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* 1-Tap Direct WhatsApp Chat */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#1E7E34] transition-all active:scale-95"
          aria-label="Chat WhatsApp Studio"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-white animate-pulse" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1E7E34] mt-1">
            Chat WA
          </span>
        </a>
      </div>
    </nav>
  );
}
