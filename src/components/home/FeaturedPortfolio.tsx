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
    <section className="py-20 lg:py-28 bg-[#F4EFE6]/50 border-y border-[#E8E1D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Visual Journal"
          title="Captured Moments, Eternal Stories"
          description="Eksplorasi pilihan karya fotografi studio dan outdoor dengan estetika editorial, penataan cahaya artistik, dan ekspresi natural tanpa paksaan."
        />

        {/* Filter Pills */}
        <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-xs uppercase tracking-[0.16em] font-medium transition-all duration-200",
                activeCategory === cat
                  ? "bg-[#161514] text-[#FCFAF6] shadow-sm scale-105"
                  : "bg-white text-[#6B6862] hover:text-[#161514] hover:bg-[#E8E1D5] border border-[#E8E1D5]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Portfolio Masonry-like Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => setSelectedPhoto(item)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[#E8E1D5] border border-[#E8E1D5] shadow-xs transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Eye Quick View Button */}
                <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <Eye className="w-4 h-4" />
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-transform duration-300">
                  <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#DFC9A8] block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal leading-tight mb-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-[#D5D0C7] font-light line-clamp-2 leading-relaxed">
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
            <span>Lihat Galeri Lengkap</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
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
                    "Karya editorial eksklusif MOMEN.POTRAIT dengan penataan komposisi estetik dan pencahayaan studio berstandar internasional."}
                </p>

                <div className="pt-4 border-t border-white/10 text-xs text-[#73706A] flex flex-col gap-1.5 font-light">
                  <div>Studio: MOMEN.POTRAIT Jakarta</div>
                  <div>Format: High-Resolution Fine Art Delivery</div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/booking`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#FCFAF6] text-[#161514] text-xs uppercase tracking-widest font-medium hover:bg-[#DFC9A8] transition-colors"
                >
                  <span>Reservasi Sesi Serupa</span>
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
