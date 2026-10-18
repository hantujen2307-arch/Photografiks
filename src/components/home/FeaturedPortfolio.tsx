"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, X } from "lucide-react";
import { PortfolioItem } from "@/types";
import { DEFAULT_PORTFOLIO } from "@/lib/constants";
import SectionHeading from "@/components/common/SectionHeading";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Semua", "Portrait", "Couple", "Graduation", "Family", "Editorial"] as const;

export default function FeaturedPortfolio({
  items = DEFAULT_PORTFOLIO,
}: {
  items?: PortfolioItem[];
}) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioItem | null>(null);

  const filteredItems =
    activeCategory === "Semua"
      ? items.slice(0, 6)
      : items.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <section id="portfolio" className="relative py-12 sm:py-20 lg:py-28 bg-[#F4EFE6]/50 border-y border-[#E8E1D5]">
      {/* Anchor alias for Indonesian url #galeri */}
      <span id="galeri" className="absolute -top-24 left-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Visual Journal"
          title="Captured Moments, Eternal Stories"
          description="Setiap foto punya cerita. Temukan inspirasi untuk mengabadikan momen spesialmu bersama MOMEN.POTRAIT."
        />

        {/* Filter Pills with touch-friendly swipe on mobile */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-2 mb-8 sm:mb-12 px-1 -mx-4 sm:mx-0 px-4 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-xs uppercase tracking-[0.14em] font-medium transition-all duration-200 shrink-0 whitespace-nowrap active:scale-95",
                activeCategory === cat
                  ? "bg-[#161514] text-[#FCFAF6] shadow-sm"
                  : "bg-white text-[#6B6862] hover:text-[#161514] hover:bg-[#E8E1D5] border border-[#E8E1D5]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Grid: 2 kolom berdampingan di HP (2 photo sampingan, 2 di bawahnya), 3 di desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedPhoto(item)}
              className="group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-[#E8E1D5] border border-[#E8E1D5] shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-98"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Eye Quick View Button */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 sm:translate-y-2 group-hover:translate-y-0">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-5 lg:p-6 text-white transform transition-transform duration-300">
                  <span className="text-[8px] sm:text-[10px] tracking-[0.16em] sm:tracking-[0.22em] uppercase font-semibold text-[#DFC9A8] block mb-0.5 sm:mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xs sm:text-lg lg:text-2xl font-normal leading-tight mb-0.5 sm:mb-2 line-clamp-1 sm:line-clamp-none">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-[10px] sm:text-xs text-[#D5D0C7] font-light line-clamp-1 sm:line-clamp-2 leading-tight sm:leading-relaxed hidden sm:block">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-14 text-center">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border border-[#161514] text-[#161514] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#161514] hover:text-[#FCFAF6] transition-all group"
          >
            <span>Jelajahi Portofolio</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full flex flex-col md:flex-row bg-[#161514] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-[#161514] transition-colors"
              aria-label="Tutup preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Photo */}
            <div className="relative aspect-[3/4] md:w-3/5 w-full bg-black">
              <Image
                src={selectedPhoto.image_url}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 800px"
              />
            </div>

            {/* Metadata & Details */}
            <div className="p-6 md:p-8 md:w-2/5 flex flex-col justify-between text-white">
              <div>
                <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#DFC9A8] block mb-2">
                  {selectedPhoto.category} Series
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-tight mb-4">
                  {selectedPhoto.title}
                </h3>
                <p className="text-sm text-[#A9A59E] font-light leading-relaxed mb-6">
                  {selectedPhoto.description ||
                    "Dokumentasi portofolio Moment Grads Palembang bersama MOMEN.POTRAIT dengan pencahayaan alami dan arahan pose estetik."}
                </p>

                <div className="pt-4 border-t border-white/10 text-xs text-[#73706A] flex flex-col gap-1.5 font-light">
                  <div>Layanan: MOMEN.POTRAIT • Moment Grads Palembang</div>
                  <div>Format: High-Resolution Delivery via Google Drive</div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/booking`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#FCFAF6] text-[#161514] text-xs uppercase tracking-widest font-medium hover:bg-[#DFC9A8] transition-colors"
                >
                  <span>Booking Sesi Foto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
