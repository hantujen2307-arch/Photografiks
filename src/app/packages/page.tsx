import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import PackagesSection from "@/components/home/PackagesSection";
import FaqSection from "@/components/home/FaqSection";
import { getPublicSupabase, withTimeout } from "@/lib/supabase/public";
import { getStoredPackages } from "@/lib/data/packages-store";
import { DEFAULT_FAQS, DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { Sparkles, Plus, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Paket Foto",
  description:
    "Daftar paket fotografi wisuda outdoor, personal portrait, couple, dan group photography bersama MOMEN.POTRAIT dan Moment Grads Palembang.",
};

export const revalidate = 60;

const ADD_ONS = [
  {
    title: "Foto Retouch Tambahan",
    price: "Rp 50.000 / foto",
    desc: "High-end editorial skin retouching dan koreksi tone warna estetik.",
  },
  {
    title: "Ekstra Waktu Sesi (30 Menit)",
    price: "Rp 350.000",
    desc: "Perpanjangan waktu sesi untuk eksplorasi spot dan pose tambahan.",
  },
  {
    title: "Layanan Kilat (Express 24 Jam)",
    price: "Rp 250.000",
    desc: "Prioritas editing selesai dan file siap download dalam 24 jam kerja.",
  },
  {
    title: "Cetak Fine Art Frame 30x45 cm",
    price: "Rp 400.000",
    desc: "Kertas fine art bertekstur museum grade lengkap dengan bingkai kayu minimalis.",
  },
];

export default async function PackagesPage() {
  let packages = getStoredPackages();
  let faqs = DEFAULT_FAQS;
  const settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getPublicSupabase();
    if (supabase) {
      const fetchPackagesAndFaqs = Promise.all([
        supabase
          .from("packages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("faqs")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      const [pkgRes, faqRes] = await withTimeout(
        fetchPackagesAndFaqs as any,
        [{ data: packages }, { data: DEFAULT_FAQS }] as any,
        1500
      );

      if (pkgRes?.data && pkgRes.data.length > 0) packages = pkgRes.data;
      if (faqRes?.data && faqRes.data.length > 0) faqs = faqRes.data;
    }
  } catch (err) {
    console.error("Error fetching packages page data:", err);
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
              Moment Grads Palembang &bull; Packages
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#161514] tracking-tight mb-4">
            Paket Fotografi Wisuda &amp; Portrait
          </h1>
          <p className="text-sm sm:text-base text-[#6B6862] font-light max-w-2xl mx-auto leading-relaxed">
            Pilihan paket foto wisuda outdoor, personal portrait, couple, family, dan group photography di area Palembang dan Indralaya. Seluruh sesi mencakup pengarahan pose natural dan akses seluruh file asli.
          </p>
        </div>
      </section>

      {/* Packages Section */}
      <PackagesSection packages={packages} />

      {/* Add-ons Section */}
      <section className="py-16 bg-[#F4EFE6]/40 border-t border-[#E8E1D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#846F54] font-semibold block mb-2">
              Layanan Pelengkap
            </span>
            <h2 className="font-serif text-3xl font-normal text-[#161514]">
              Pilihan Add-On Sesi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ADD_ONS.map((addon, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-[#E8E1D5] flex items-start gap-4 shadow-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] flex items-center justify-center text-[#846F54] shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-base font-normal text-[#161514]">
                      {addon.title}
                    </h3>
                    <span className="text-xs font-semibold text-[#B8976C]">
                      {addon.price}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6862] font-light leading-relaxed">
                    {addon.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-[#846F54] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#9A8973]" />
            <span>Add-on dapat Anda konfirmasikan langsung kepada tim kami saat hari pelaksanaan sesi.</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection faqs={faqs} />

      <Footer settings={settings} />
    </main>
  );
}
