import React from "react";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { getPublicSupabase, withTimeout } from "@/lib/supabase/public";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { createWhatsAppUrl } from "@/lib/utils";
import {
  Sparkles,
  MapPin,
  Clock,
  Mail,
  MessageCircle,
  ArrowRight,
  Send,
} from "lucide-react";

export const metadata = {
  title: "Kontak & Layanan Fotografi",
  description:
    "Hubungi MOMEN.POTRAIT dan Moment Grads Palembang. Konsultasi konsep pemotretan wisuda outdoor, personal portrait, couple, dan group photography di Palembang & Indralaya.",
};

export const revalidate = 60;

export default async function ContactPage() {
  let settings = DEFAULT_SITE_SETTINGS;

  try {
    const supabase = getPublicSupabase();
    if (supabase) {
      const fetchSettings = supabase.from("site_settings").select("key, value");
      const { data } = await withTimeout(
        fetchSettings as any,
        { data: [] },
        1500
      );

      if (data && data.length > 0) {
        const merged = { ...DEFAULT_SITE_SETTINGS };
        data.forEach((row: { key: string; value: unknown }) => {
          if (row.key in merged) {
            (merged as Record<string, unknown>)[row.key] = row.value;
          }
        });
        settings = merged;
      }
    }
  } catch (err) {
    console.error("Error fetching contact page settings:", err);
  }

  const waUrl = createWhatsAppUrl(
    settings.whatsapp_number,
    "Halo MOMEN.POTRAIT & Moment Grads Palembang, saya ingin konsultasi mengenai jadwal dan paket foto."
  );

  return (
    <main className="min-h-screen flex flex-col bg-[#FCFAF6]">
      <Navbar />

      {/* Header Banner */}
      <section className="pt-12 pb-16 bg-[#F4EFE6]/70 border-b border-[#E8E1D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E1D5] mb-5">
            <Sparkles className="w-3.5 h-3.5 text-[#9A8973]" />
            <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-semibold text-[#846F54]">
              Moment Grads Palembang &bull; Contact
            </span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#161514] tracking-tight mb-4">
            Hubungi Kami
          </h1>
          <p className="text-sm sm:text-base text-[#6B6862] font-light max-w-2xl mx-auto leading-relaxed">
            Punya pertanyaan mengenai sesi foto wisuda outdoor, personal portrait, pemilihan lokasi di Palembang &amp; Indralaya, atau ketersediaan jadwal? Tim kami siap membantu Anda.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#161514] text-[#FCFAF6] p-8 sm:p-10 rounded-3xl shadow-xl">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#C9BBA7] font-semibold block mb-3">
                  Informasi Resmi Layanan
                </span>
                <h2 className="font-serif text-3xl font-normal text-white mb-8">
                  MOMEN.POTRAIT
                </h2>

                <div className="space-y-6 text-sm text-[#D5D0C7] font-light">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#DFC9A8] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-[#A9A59E] mb-1 font-semibold">
                        Area Layanan Utama
                      </strong>
                      <p className="leading-relaxed">{settings.studio_address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#DFC9A8] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-[#A9A59E] mb-1 font-semibold">
                        Jam Operasional
                      </strong>
                      <p className="leading-relaxed">{settings.operating_hours_text}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#DFC9A8] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-xs uppercase tracking-wider text-[#A9A59E] mb-1 font-semibold">
                        Email Resmi
                      </strong>
                      <a
                        href={`mailto:${settings.email_contact}`}
                        className="hover:text-white transition-colors underline"
                      >
                        {settings.email_contact}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <span className="text-xs text-[#A9A59E] block mb-3">
                  Respon Cepat Tim Studio:
                </span>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-4 rounded-full bg-[#25D366] text-white text-xs uppercase tracking-[0.16em] font-semibold hover:bg-[#20ba59] transition-all shadow-md group"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Konsultasi via WhatsApp</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </div>

            {/* Inquiry Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-[#E8E1D5] shadow-xs">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#846F54] font-semibold block mb-2">
                Kirim Pesan
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#161514] mb-3">
                Konsultasikan Konsep Anda
              </h2>
              <p className="text-sm text-[#6B6862] font-light mb-8">
                Isi form di bawah ini dan tim studio kami akan membalas pertanyaan Anda dalam waktu maksimal 2-4 jam.
              </p>

              <form
                action={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}`}
                method="GET"
                target="_blank"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama"
                      required
                      placeholder="e.g. Raditya Pratama"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      name="wa"
                      required
                      placeholder="e.g. 081234567890"
                      className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                    Kategori Sesi Yang Diminati
                  </label>
                  <select
                    name="kategori"
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                  >
                    <option value="Portrait">The Solo Editorial (Portrait)</option>
                    <option value="Couple">Intimate Couple Story</option>
                    <option value="Graduation">Graduation &amp; Heritage</option>
                    <option value="Family">Family Generations</option>
                    <option value="Custom">Custom / Commercial Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                    Ceritakan Rencana / Pertanyaan Anda
                  </label>
                  <textarea
                    name="text"
                    rows={4}
                    required
                    placeholder="Tuliskan tanggal yang Anda incar, jumlah peserta, atau referensi konsep..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#161514] text-[#FCFAF6] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] transition-all shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Konsultasi via WhatsApp</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer settings={settings} />
    </main>
  );
}
