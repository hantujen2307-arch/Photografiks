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
              className="group flex items-center gap-2.5 transition-transform hover:opacity-90"
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

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#161514] hover:bg-[#F4EFE6] rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-[#FCFAF6] flex flex-col pt-24 px-6 pb-8 animate-in fade-in duration-200">
          <div className="flex flex-col gap-5 divide-y divide-[#E8E1D5]/60">
            <div className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-lg font-serif tracking-wider py-2 transition-colors flex items-center justify-between",
                      isActive
                        ? "text-[#161514] font-semibold"
                        : "text-[#6B6862] hover:text-[#161514]"
                    )}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#161514]" />
                    )}
                  </NextLink>
                );
              })}
            </div>

            <div className="pt-6 flex flex-col gap-3">
              <NextLink
                href="/booking/status"
                className="flex items-center justify-center gap-2 py-3 text-sm font-medium tracking-wider text-[#6B6862] bg-[#F4EFE6] rounded-xl hover:bg-[#E8E1D5] transition-colors"
              >
                <Clock className="w-4 h-4 text-[#9A8973]" />
                <span>Cek Status Reservasi</span>
              </NextLink>

              <NextLink
                href="/booking"
                className="flex items-center justify-center gap-2 py-3.5 text-sm font-medium tracking-wider text-[#FCFAF6] bg-[#161514] rounded-xl hover:bg-[#232220] transition-colors shadow-sm"
              >
                <span>Book Your Session</span>
                <ArrowRight className="w-4 h-4" />
              </NextLink>

              <NextLink
                href="/admin"
                className="flex items-center justify-center gap-1.5 pt-3 text-xs tracking-wider text-[#9A8973] hover:text-[#161514] transition-colors"
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
