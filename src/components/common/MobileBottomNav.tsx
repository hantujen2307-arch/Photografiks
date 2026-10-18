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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If user is already on the target page, scroll smoothly to top
    if (pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav
      aria-label="Navigasi Mobile Bawah"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FCFAF6]/98 backdrop-blur-xl border-t border-[#E8E1D5] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] pointer-events-auto select-none"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="flex-1 flex flex-col items-center justify-center -mt-3.5 group touch-manipulation min-h-[54px]"
                aria-label="Pesan Sesi Foto (Booking)"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90",
                    isActive
                      ? "bg-[#161514] text-[#B8976C] ring-2 ring-[#B8976C] ring-offset-2 ring-offset-[#FCFAF6]"
                      : "bg-[#161514] text-[#FCFAF6] hover:bg-[#2A2926]"
                  )}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
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
              onClick={(e) => handleNavClick(e, item.href)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all active:scale-92 touch-manipulation min-h-[48px]",
                isActive
                  ? "text-[#161514] font-semibold"
                  : "text-[#846F54] hover:text-[#161514]"
              )}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive ? "stroke-[2.2] scale-105" : "stroke-[1.75]"
                  )}
                />
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#161514] absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider mt-1",
                  isActive ? "font-bold text-[#161514]" : "font-medium text-[#846F54]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Direct WhatsApp Chat Action */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[#1E7E34] transition-all active:scale-92 touch-manipulation min-h-[48px]"
          aria-label="Chat WhatsApp Studio Langsung"
        >
          <div className="relative w-5 h-5 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-[#25D366] fill-[#25D366]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#25D366] ring-2 ring-[#FCFAF6] animate-pulse" />
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1E7E34] mt-1">
            Chat WA
          </span>
        </a>
      </div>
    </nav>
  );
}
