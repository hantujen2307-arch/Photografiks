import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, Clock, Image as ImageIcon, ArrowRight, Sparkles } from "lucide-react";
import { PackageItem } from "@/types";
import { DEFAULT_PACKAGES } from "@/lib/constants";
import { formatIDR } from "@/lib/utils";
import SectionHeading from "@/components/common/SectionHeading";

export default function PackagesSection({
  packages = DEFAULT_PACKAGES,
}: {
  packages?: PackageItem[];
}) {
  const activePackages = packages
    .filter((pkg) => pkg.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="relative py-12 sm:py-20 lg:py-32 bg-[#FCFAF6]" id="packages">
      {/* Anchor alias for Indonesian url #paket */}
      <span id="paket" className="absolute -top-24 left-0 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Pricing &amp; Experiences"
          title="Curated Photography Packages"
          description="Investasi berharga untuk mengabadikan momen istimewa. Seluruh paket mencakup studio privat, pengarahan pose profesional, dan file asli resolusi penuh."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8">
          {activePackages.map((pkg, idx) => {
            const isFeatured = idx === 1; // Highlight the 2nd package as most popular
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 transition-all duration-300 ${
                  isFeatured
                    ? "bg-[#161514] text-[#FCFAF6] shadow-xl sm:shadow-2xl ring-1 ring-white/10 md:-translate-y-2"
                    : "bg-white text-[#161514] border border-[#E8E1D5] shadow-2xs hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                {/* Popular Badge */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#B8976C] text-[#161514] text-[10px] uppercase font-bold tracking-widest shadow-md">
                    <Sparkles className="w-3 h-3" />
                    <span>Paling Favorit</span>
                  </div>
                )}

                <div>
                  {/* Package Hero Image */}
                  {pkg.image_url && (
                    <div className="relative aspect-[16/10] w-full rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 shadow-2xs border border-current/10">
                      <Image
                        src={pkg.image_url}
                        alt={pkg.name}
                        fill
                        unoptimized={pkg.image_url.startsWith("data:")}
                        className="object-cover object-center transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50 pointer-events-none" />
                    </div>
                  )}

                  {/* Package Header */}
                  <div className="mb-4 sm:mb-6">
                    <span
                      className={`text-[10px] tracking-[0.2em] uppercase font-semibold block mb-1 ${
                        isFeatured ? "text-[#DFC9A8]" : "text-[#9A8973]"
                      }`}
                    >
                      Exclusive Experience
                    </span>
                    <h3
                      className={`font-serif text-xl sm:text-2xl font-normal tracking-tight mb-1.5 sm:mb-2 ${
                        isFeatured ? "text-white" : "text-[#161514]"
                      }`}
                    >
                      {pkg.name}
                    </h3>
                    <p
                      className={`text-xs font-light leading-relaxed min-h-[32px] sm:min-h-[36px] ${
                        isFeatured ? "text-[#A9A59E]" : "text-[#6B6862]"
                      }`}
                    >
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-current/10">
                    <div className="flex items-baseline gap-1">
                      <span className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
                        {formatIDR(pkg.price)}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] sm:text-[11px] font-light mt-0.5 sm:mt-1 block ${
                        isFeatured ? "text-[#A9A59E]" : "text-[#846F54]"
                      }`}
                    >
                      Nett per sesi studio / on-location
                    </span>
                  </div>

                  {/* Quick Specs */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div
                      className={`flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 rounded-xl text-xs font-light ${
                        isFeatured ? "bg-white/5 text-[#D5D0C7]" : "bg-[#F4EFE6] text-[#4B4944]"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#B8976C] shrink-0" />
                      <span>{pkg.duration_minutes} Menit Sesi</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-light ${
                        isFeatured ? "bg-white/5 text-[#D5D0C7]" : "bg-[#F4EFE6] text-[#4B4944]"
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#B8976C] shrink-0" />
                      <span className="truncate">Retouch + RAW</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span
                      className={`text-[11px] uppercase tracking-wider font-semibold block ${
                        isFeatured ? "text-[#C9BBA7]" : "text-[#846F54]"
                      }`}
                    >
                      Fasilitas Termasuk:
                    </span>
                    <ul className="space-y-2.5 text-xs font-light">
                      {pkg.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isFeatured ? "text-[#DFC9A8]" : "text-[#9A8973]"
                            }`}
                          />
                          <span
                            className={
                              isFeatured ? "text-[#E6E1D8]" : "text-[#4B4944]"
                            }
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Booking Button */}
                <div className="pt-2">
                  <Link
                    href={`/booking?package=${pkg.id}`}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-xs uppercase tracking-[0.16em] font-medium transition-all group ${
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
