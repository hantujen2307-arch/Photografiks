"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Check,
  Clock,
  Image as ImageIcon,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoveRight,
} from "lucide-react";
import { PackageItem } from "@/types";
import { DEFAULT_PACKAGES } from "@/lib/constants";
import { formatIDR } from "@/lib/utils";
import SectionHeading from "@/components/common/SectionHeading";

export default function PackagesSection({
  packages = DEFAULT_PACKAGES,
}: {
  packages?: PackageItem[];
}) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const activePackages = packages
    .filter((pkg) => pkg.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        slider.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [activePackages.length]);

  const scrollByAmount = (offset: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-12 sm:py-20 lg:py-28 bg-[#FCFAF6] overflow-hidden" id="packages">
      {/* Anchor alias for Indonesian url #paket */}
      <span id="paket" className="absolute -top-24 left-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Slider Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <SectionHeading
              eyebrow="Pricing & Experiences"
              title="Curated Photography Packages"
              description="Investasi berharga untuk mengabadikan momen istimewa. Seluruh paket mencakup studio privat, pengarahan pose profesional, dan file asli resolusi penuh."
            />
          </div>

          {/* Desktop Slider Controls */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <button
              onClick={() => scrollByAmount(-320)}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border border-[#D5CDBC] flex items-center justify-center transition-all ${
                canScrollLeft
                  ? "bg-white text-[#161514] hover:bg-[#161514] hover:text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed"
              }`}
              aria-label="Geser ke kiri"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollByAmount(320)}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border border-[#D5CDBC] flex items-center justify-center transition-all ${
                canScrollRight
                  ? "bg-white text-[#161514] hover:bg-[#161514] hover:text-white shadow-xs"
                  : "bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed"
              }`}
              aria-label="Geser ke kanan"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Swipe Indicator Hint */}
        <div className="flex items-center justify-between text-[11px] text-[#846F54] mb-3 px-1 md:hidden">
          <span className="flex items-center gap-1.5 font-medium">
            <span>Geser kartu ke samping</span>
            <MoveRight className="w-3.5 h-3.5 animate-pulse text-[#B8976C]" />
          </span>
          <span className="text-[10px] text-[#9A8973]">
            {activePackages.length} Paket Pilihan
          </span>
        </div>

        {/* HORIZONTAL SLIDER CONTAINER (Bersusun Sampingan & Di Geser) */}
        <div
          ref={sliderRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pt-4 pb-6 -mx-4 sm:mx-0 px-4 sm:px-0 cursor-grab active:cursor-grabbing"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {activePackages.map((pkg, idx) => {
            const isFeatured = idx === 1; // Highlight package 2 as popular
            return (
              <div
                key={pkg.id}
                className={`relative w-[275px] sm:w-[310px] md:w-[330px] shrink-0 snap-start flex flex-col justify-between rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all duration-300 ${
                  isFeatured
                    ? "bg-[#161514] text-[#FCFAF6] shadow-xl ring-1 ring-white/10"
                    : "bg-white text-[#161514] border border-[#E8E1D5] shadow-2xs hover:shadow-lg"
                }`}
              >
                {/* Popular Badge */}
                {isFeatured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#B8976C] text-[#161514] text-[9px] uppercase font-bold tracking-widest shadow-md whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    <span>Paling Favorit</span>
                  </div>
                )}

                <div>
                  {/* Package Hero Image (Lebih Ringkas & Pas) */}
                  {pkg.image_url ? (
                    <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-3.5 shadow-2xs bg-[#F4EFE6]">
                      <Image
                        src={pkg.image_url}
                        alt={pkg.name}
                        fill
                        unoptimized={pkg.image_url.startsWith("data:") || pkg.image_url.startsWith("blob:")}
                        className="object-cover object-center transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 640px) 280px, 330px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 pointer-events-none" />
                    </div>
                  ) : null}

                  {/* Header Title & Tagline Ringkas */}
                  <div className="mb-3">
                    <span
                      className={`text-[9px] tracking-[0.2em] uppercase font-semibold block mb-0.5 ${
                        isFeatured ? "text-[#DFC9A8]" : "text-[#9A8973]"
                      }`}
                    >
                      Exclusive Experience
                    </span>
                    <h3
                      className={`font-serif text-lg sm:text-xl font-normal tracking-tight mb-1 truncate ${
                        isFeatured ? "text-white" : "text-[#161514]"
                      }`}
                      title={pkg.name}
                    >
                      {pkg.name}
                    </h3>
                    {pkg.tagline && (
                      <p
                        className={`text-[11px] font-light leading-snug line-clamp-2 h-[32px] ${
                          isFeatured ? "text-[#A9A59E]" : "text-[#6B6862]"
                        }`}
                      >
                        {pkg.tagline}
                      </p>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="mb-3 pb-3 border-b border-current/10">
                    <div className="font-serif text-xl sm:text-2xl font-semibold tracking-tight">
                      {formatIDR(pkg.price)}
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-light block mt-0.5 ${
                        isFeatured ? "text-[#A9A59E]" : "text-[#846F54]"
                      }`}
                    >
                      Nett per sesi studio / on-location
                    </span>
                  </div>

                  {/* Quick Specs (Durasi & Retouch) */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 p-2 rounded-xl font-light truncate ${
                        isFeatured ? "bg-white/5 text-[#D5D0C7]" : "bg-[#F4EFE6] text-[#4B4944]"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#B8976C] shrink-0" />
                      <span className="truncate">{pkg.duration_minutes} Menit Sesi</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 p-2 rounded-xl font-light truncate ${
                        isFeatured ? "bg-white/5 text-[#D5D0C7]" : "bg-[#F4EFE6] text-[#4B4944]"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#B8976C] shrink-0" />
                      <span className="truncate">{pkg.photo_count_text ? pkg.photo_count_text.slice(0, 16) : "Retouch + RAW"}</span>
                    </div>
                  </div>

                  {/* Features List Ringkas (3 item teratas agar tidak panjang ke bawah) */}
                  {pkg.features && pkg.features.length > 0 && (
                    <div className="space-y-1.5 mb-4 text-[11px]">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold block ${
                          isFeatured ? "text-[#C9BBA7]" : "text-[#846F54]"
                        }`}
                      >
                        Fasilitas Termasuk:
                      </span>
                      <ul className="space-y-1 font-light">
                        {pkg.features.slice(0, 3).map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-1.5 truncate">
                            <Check
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isFeatured ? "text-[#DFC9A8]" : "text-[#B8976C]"
                              }`}
                            />
                            <span
                              className={`truncate ${
                                isFeatured ? "text-[#E6E1D8]" : "text-[#4B4944]"
                              }`}
                              title={feature}
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                        {pkg.features.length > 3 && (
                          <li className="text-[10px] text-[#9A8973] italic pl-5 pt-0.5">
                            +{pkg.features.length - 3} fasilitas eksklusif lainnya
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Booking Button */}
                <div className="pt-2">
                  <Link
                    href={`/booking?package=${pkg.id}`}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full text-xs uppercase tracking-wider font-medium transition-all group ${
                      isFeatured
                        ? "bg-[#FCFAF6] text-[#161514] hover:bg-[#DFC9A8] shadow-md"
                        : "bg-[#161514] text-[#FCFAF6] hover:bg-[#2A2926]"
                    }`}
                  >
                    <span>Pilih Paket Ini</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
