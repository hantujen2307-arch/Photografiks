import React, { Suspense } from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import BookingWizard from "@/components/booking/BookingWizard";
import { getPublicSupabase, withTimeout } from "@/lib/supabase/public";
import { getStoredPackages } from "@/lib/data/packages-store";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { Sparkles, Loader2 } from "lucide-react";

export const metadata = {
  title: "Reservasi Sesi Studio",
  description:
    "Pilih paket fotografi dan amankan slot jadwal foto studio Anda di MOMEN.POTRAIT Jakarta.",
};

export const revalidate = 60;

export default async function BookingPage() {
  let packages = getStoredPackages();
  let settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getPublicSupabase();
    if (supabase) {
      const fetchPackagesAndSettings = Promise.all([
        supabase
          .from("packages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
        supabase.from("site_settings").select("key, value"),
      ]);

      const [pkgRes, settingsRes] = await withTimeout(
        fetchPackagesAndSettings as any,
        [{ data: packages }, { data: [] }] as any,
        1500
      );

      if (pkgRes?.data && pkgRes.data.length > 0) packages = pkgRes.data;
      if (settingsRes?.data && settingsRes.data.length > 0) {
        const merged = { ...DEFAULT_SITE_SETTINGS };
        settingsRes.data.forEach((row: { key: string; value: unknown }) => {
          if (row.key in merged) {
            (merged as Record<string, unknown>)[row.key] = row.value;
          }
        });
        settings = merged;
      }
    }
  } catch (err) {
    console.error("Error loading booking page data:", err);
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#FCFAF6]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-10 pb-12 bg-[#F4EFE6]/70 border-b border-[#E8E1D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E1D5] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#9A8973]" />
            <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-semibold text-[#846F54]">
              Studio Reservation
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#161514] tracking-tight mb-3">
            Reservasi Sesi Fotografi
          </h1>
          <p className="text-sm text-[#6B6862] font-light max-w-xl mx-auto leading-relaxed">
            Sistem ketersediaan kalender live kami memastikan jadwal yang Anda pilih tidak akan terbentur dengan klien lain.
          </p>
        </div>
      </section>

      {/* Booking Form Wizard */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
                <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
                <span>Memuat formulir pemesanan...</span>
              </div>
            }
          >
            <BookingWizard
              packages={packages}
              defaultSettingsWhatsapp={settings.whatsapp_number}
            />
          </Suspense>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
