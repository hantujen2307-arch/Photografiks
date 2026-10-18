import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import FeaturedPortfolio from "@/components/home/FeaturedPortfolio";
import { getPublicSupabase, withTimeout } from "@/lib/supabase/public";
import { DEFAULT_PORTFOLIO, DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export const metadata = {
  title: "Galeri Portofolio",
  description:
    "Eksplorasi dokumentasi karya editorial, portrait, wisuda, couple, dan keluarga oleh MOMEN.POTRAIT Studio Jakarta.",
};

export const revalidate = 60;

export default async function PortfolioPage() {
  let portfolio = DEFAULT_PORTFOLIO;
  const settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getPublicSupabase();
    if (supabase) {
      const fetchPortfolio = supabase
        .from("portfolio_items")
        .select("*")
        .order("sort_order", { ascending: true });

      const { data } = await withTimeout(
        fetchPortfolio as any,
        { data: DEFAULT_PORTFOLIO },
        1500
      );

      if (data && data.length > 0) {
        portfolio = data;
      }
    }
  } catch (err) {
    console.error("Error fetching portfolio:", err);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FCFAF6]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-12 pb-16 bg-[#F4EFE6]/70 border-b border-[#E8E1D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E1D5] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#9A8973]" />
            <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-semibold text-[#846F54]">
              Visual Anthology
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#161514] tracking-tight mb-4">
            Galeri Portofolio Studio
          </h1>
          <p className="text-sm sm:text-base text-[#6B6862] font-light max-w-2xl mx-auto leading-relaxed">
            Kumpulan karya fotografi editorial, potret personal, kisah cinta, perayaan kelulusan, dan kehangatan keluarga yang kami abadikan dengan penuh ketelitian rasa.
          </p>
        </div>
      </section>

      {/* Portfolio Gallery Section */}
      <FeaturedPortfolio items={portfolio} />

      {/* Booking CTA Banner */}
      <section className="py-20 bg-[#161514] text-[#FCFAF6] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9BBA7] font-semibold block mb-3">
            Inspirasi Sesi Anda
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal mb-6 leading-tight">
            Siap Mengabadikan Momen Berharga Anda?
          </h2>
          <p className="text-sm sm:text-base text-[#A9A59E] font-light max-w-xl mx-auto mb-10 leading-relaxed">
            Slot sesi studio kami terbatas setiap minggunya untuk menjaga kualitas pengerjaan dan privasi Anda. Amankan tanggal pilihan Anda sekarang.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="px-8 py-4 rounded-full bg-[#FCFAF6] text-[#161514] text-xs uppercase tracking-[0.18em] font-medium hover:bg-[#DFC9A8] transition-all flex items-center gap-2 shadow-lg"
            >
              <span>Jadwalkan Sesi Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/packages"
              className="px-8 py-4 rounded-full border border-white/20 text-[#FCFAF6] text-xs uppercase tracking-[0.18em] font-medium hover:bg-white/10 transition-all"
            >
              <span>Lihat Detail Paket</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
