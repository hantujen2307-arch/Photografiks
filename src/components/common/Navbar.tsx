"use client";

import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, X, ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/packages", label: "Packages" },
  { href: "/booking", label: "Booking" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-[#FCFAF6]/90 backdrop-blur-md border-b border-[#E8E1D5]/80 shadow-xs py-3.5"
            : "bg-[#FCFAF6]/60 backdrop-blur-xs border-b border-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Brand Logo */}
            <NextLink
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="group flex items-center gap-2.5 transition-transform hover:opacity-90 min-h-[44px]"
              aria-label="MOMEN.POTRAIT Home"
            >
              <div className="w-8 h-8 rounded-full bg-[#161514] flex items-center justify-center text-[#FCFAF6] transition-transform group-hover:scale-105">
                <Camera className="w-4 h-4 stroke-[1.75]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-[0.2em] font-medium text-[#161514] uppercase">
                  Momen<span className="font-light text-[#9A8973]">.</span>Potrait
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#9A8973] font-sans -mt-0.5">
                  Studio &amp; Portraiture
                </span>
              </div>
            </NextLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-xs tracking-[0.18em] uppercase transition-colors py-1 relative font-medium",
                      isActive
                        ? "text-[#161514] font-semibold"
                        : "text-[#6B6862] hover:text-[#161514]"
                    )}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#161514] rounded-full" />
                    )}
                  </NextLink>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <NextLink
                href="/booking/status"
                className="text-xs tracking-wider uppercase text-[#6B6862] hover:text-[#161514] transition-colors flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-[#F4EFE6]/60"
              >
                <Clock className="w-3.5 h-3.5 text-[#9A8973]" />
                <span>Cek Status</span>
              </NextLink>

              <NextLink
                href="/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#161514] text-[#FCFAF6] text-xs uppercase tracking-[0.15em] font-medium hover:bg-[#232220] transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Book Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>
            </div>

            {/* Mobile Actions: Quick WA & Hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <a
                href="https://wa.me/6285157335443?text=Halo%20MOMEN.POTRAIT%2C%20saya%20ingin%20konsultasi%20sesi%20foto"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#EBF7EE] text-[#25D366] border border-[#C3E6CB] flex items-center justify-center active:scale-95 transition-all shadow-2xs"
                aria-label="Chat WhatsApp Studio"
              >
                <span className="sr-only">WhatsApp</span>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 text-[#161514] hover:bg-[#F4EFE6] rounded-xl transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (z-[60] to cleanly overlay all elements including bottom nav) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden bg-[#FCFAF6] flex flex-col pt-6 px-6 pb-12 overflow-y-auto animate-in fade-in duration-200">
          {/* Header inside drawer with close button */}
          <div className="flex items-center justify-between pb-5 border-b border-[#E8E1D5]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#161514] flex items-center justify-center text-[#FCFAF6]">
                <Camera className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="font-serif text-base tracking-[0.2em] font-medium text-[#161514] uppercase">
                MOMEN<span className="text-[#9A8973]">.</span>POTRAIT
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 text-[#161514] bg-[#F4EFE6] hover:bg-[#E8E1D5] rounded-full transition-colors active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-5 divide-y divide-[#E8E1D5]/60 mt-4">
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "text-lg font-serif tracking-wider py-3 px-3 rounded-xl transition-colors flex items-center justify-between min-h-[48px] active:scale-98",
                      isActive
                        ? "text-[#161514] font-semibold bg-[#F4EFE6]"
                        : "text-[#6B6862] hover:text-[#161514]"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive ? (
                      <span className="w-2 h-2 rounded-full bg-[#161514]" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#C9BBA7]" />
                    )}
                  </NextLink>
                );
              })}
            </div>

            <div className="pt-6 flex flex-col gap-3">
              <NextLink
                href="/booking/status"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium tracking-wider text-[#6B6862] bg-[#F4EFE6] rounded-xl hover:bg-[#E8E1D5] transition-colors min-h-[48px] active:scale-98"
              >
                <Clock className="w-4 h-4 text-[#9A8973]" />
                <span>Cek Status Reservasi</span>
              </NextLink>

              <NextLink
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-4 text-sm font-medium tracking-wider text-[#FCFAF6] bg-[#161514] rounded-xl hover:bg-[#232220] transition-colors shadow-md min-h-[48px] active:scale-98"
              >
                <span>Book Your Session</span>
                <ArrowRight className="w-4 h-4" />
              </NextLink>

              <NextLink
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 pt-3 text-xs tracking-wider text-[#9A8973] hover:text-[#161514] transition-colors min-h-[44px]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Portal Studio Admin</span>
              </NextLink>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content jump */}
      <div className="h-20" />
    </>
  );
}
