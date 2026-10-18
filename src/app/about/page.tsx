import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { Sparkles, ArrowRight, Heart, Award, Shield } from "lucide-react";

export const metadata = {
  title: "Tentang Studio & Fotografer",
  description:
    "Filosofi, kisah studio, dan visi artistik MOMEN.POTRAIT dalam menghasilkan potret editorial abadi.",
};

export default async function AboutPage() {
  let settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data } = await supabase.from("site_settings").select("key, value");
      if (data && data.length > 0) {
        const merged = { ...DEFAULT_SITE_SETTINGS };
        data.forEach((row) => {
          if (row.key in merged) {
            (merged as Record<string, unknown>)[row.key] = row.value;
          }
        });
        settings = merged;
      }
    }
  } catch (err) {
    console.error("Error fetching about page data:", err);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FCFAF6]">
      <Navbar />

      {/* Hero Banner */}
      <section className="pt-12 pb-20 bg-[#F4EFE6]/70 border-b border-[#E8E1D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E1D5] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#9A8973]" />
            <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-semibold text-[#846F54]">
              Studio Philosophy
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#161514] tracking-tight mb-6">
            Di Balik Lensa MOMEN.POTRAIT
          </h1>
          <p className="text-base sm:text-lg text-[#6B6862] font-light max-w-2xl mx-auto leading-relaxed">
            Menghargai setiap detik kehidupan manusia dengan karya visual yang jujur, bersahaja, dan sarat makna.
          </p>
        </div>
      </section>

      {/* Main Story & Photographer Profile */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Visual Portrait */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85"
                  alt="Lead Photographer MOMEN.POTRAIT"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 500px"
                />
              </div>

              {/* Floating Quote Badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#161514] text-[#FCFAF6] p-6 rounded-2xl shadow-xl max-w-xs border border-white/10 hidden sm:block">
                <p className="font-serif text-sm italic mb-2 text-[#DFC9A8]">
                  &ldquo;Foto terbaik bukanlah tentang kesempurnaan pose, melainkan tentang kejujuran jiwa.&rdquo;
                </p>
                <span className="text-[10px] uppercase tracking-wider text-[#A9A59E] block">
                  Lead Photographer &amp; Founder
                </span>
              </div>
            </div>

            {/* Story Text */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <span className="text-xs uppercase tracking-[0.2em] text-[#846F54] font-semibold">
                Kisah &amp; Dedikasi Kami
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#161514] leading-tight">
                Mengabadikan Keaslian Jiwa Tanpa Kepalsuan
              </h2>
              <div className="space-y-4 text-sm sm:text-base text-[#4B4944] font-light leading-relaxed">
                <p>{settings.about_story}</p>
                <p>{settings.about_philosophy}</p>
                <p>
                  Kami merancang studio kami sebagai ruang yang tenang dan bersahabat. Setiap sesi dijadwalkan secara privat sehingga Anda mendapatkan ketenangan penuh tanpa gangguan dari pengunjung lain.
                </p>
              </div>

              {/* Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E8E1D5]">
                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#846F54]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-[#161514]">Kenyamanan Personal</h3>
                  <p className="text-xs text-[#6B6862] font-light">
                    Sesi foto privat tanpa rasa canggung atau terburu-buru.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#846F54]">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-[#161514]">Standar Editorial</h3>
                  <p className="text-xs text-[#6B6862] font-light">
                    Grading warna mewah yang bertahan sepanjang masa.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="w-9 h-9 rounded-full bg-[#F4EFE6] flex items-center justify-center text-[#846F54]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base text-[#161514]">File Asli 100%</h3>
                  <p className="text-xs text-[#6B6862] font-light">
                    Hak kepemilikan seluruh file mentah tanpa batasan unduhan.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/booking"
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#161514] text-[#FCFAF6] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] transition-all shadow-md"
                >
                  <span>Reservasi Sesi Anda</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
