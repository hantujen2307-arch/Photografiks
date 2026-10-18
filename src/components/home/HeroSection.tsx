import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Award, Star } from "lucide-react";

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
}

export default function HeroSection({
  headline = "Every Moment Deserves to Be Remembered.",
  subheadline = "Studio fotografi editorial & portrait di Jakarta. Menghadirkan karya visual yang intim, abadi, dan bercerita tentang jati diri Anda.",
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-6 pb-20 lg:pt-12 lg:pb-32">
      {/* Decorative background aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#EAE3D4]/50 rounded-full blur-[140px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F4EFE6] border border-[#E8E1D5] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#9A8973]" />
              <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-semibold text-[#846F54]">
                Editorial &amp; Timeless Portrait Studio
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal tracking-tight text-[#161514] leading-[1.12] mb-6">
              {headline}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-[#6B6862] font-light leading-relaxed max-w-xl mb-10">
              {subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#161514] text-[#FCFAF6] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#2A2926] transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Book Your Session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full border border-[#D5CDBC] text-[#161514] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#F4EFE6] transition-all"
              >
                <span>Explore Portfolio</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-8 border-t border-[#E8E1D5] w-full grid grid-cols-3 gap-6">
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-medium text-[#161514] block">
                  650+
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#9A8973] font-sans">
                  Sesi Terlaksana
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-serif text-2xl sm:text-3xl font-medium text-[#161514]">
                    4.9
                  </span>
                  <Star className="w-4 h-4 fill-[#B8976C] text-[#B8976C] inline -mt-1" />
                </div>
                <span className="text-[11px] uppercase tracking-wider text-[#9A8973] font-sans">
                  Client Rating
                </span>
              </div>
              <div>
                <span className="font-serif text-2xl sm:text-3xl font-medium text-[#161514] block">
                  100%
                </span>
                <span className="text-[11px] uppercase tracking-wider text-[#9A8973] font-sans">
                  Original RAW Files
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Composition */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Primary Main Image */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                  alt="MOMEN.POTRAIT Editorial Model"
                  fill
                  priority
                  className="object-cover object-center scale-[1.02] hover:scale-105 transition-transform duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[10px] tracking-[0.25em] uppercase font-semibold text-[#DFC9A8] block mb-1">
                    Signature Portrait
                  </span>
                  <h3 className="font-serif text-xl font-normal leading-snug">
                    Natural Light &amp; Editorial Intimacy
                  </h3>
                </div>
              </div>

              {/* Floating Overlap Thumbnail */}
              <div className="hidden sm:block absolute -bottom-8 -left-10 w-44 aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 border-white bg-white">
                <Image
                  src="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=600&q=80"
                  alt="Couple Moment"
                  fill
                  className="object-cover object-center"
                  sizes="180px"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs py-1 px-2 rounded text-[9px] text-white tracking-widest uppercase text-center font-sans">
                  Couple Story
                </div>
              </div>

              {/* Floating Stamp / Badge */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#161514] text-[#FCFAF6] p-2 flex flex-col items-center justify-center text-center shadow-lg border border-white/20">
                <Award className="w-5 h-5 text-[#B8976C] mb-1" />
                <span className="text-[9px] uppercase tracking-widest font-semibold text-[#DFC9A8]">
                  Curated
                </span>
                <span className="text-[8px] text-[#A9A59E] uppercase tracking-wider">
                  Studio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
