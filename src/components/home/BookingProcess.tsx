import React from "react";
import { Package, CalendarCheck, FileCheck, Smile } from "lucide-react";
import SectionHeading from "@/components/common/SectionHeading";

const STEPS = [
  {
    step: "01",
    icon: Package,
    title: "Pilih Pengalaman Anda",
    description:
      "Tentukan paket fotografi yang paling sesuai dengan cerita Anda—mulai dari The Solo Editorial, Intimate Couple, hingga Family Generations.",
  },
  {
    step: "02",
    icon: CalendarCheck,
    title: "Pilih Jadwal & Slot Waktu",
    description:
      "Gunakan kalender interaktif kami untuk memilih tanggal dan slot jam yang tersedia. Sistem kami otomatis mengunci slot untuk mencegah double booking.",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Terima Referensi & Arahan Konsep",
    description:
      "Dapatkan nomor referensi resmi dan panduan moodboard pakaian serta persiapan sesi dari tim kreatif MOMEN.POTRAIT.",
  },
  {
    step: "04",
    icon: Smile,
    title: "Nikmati Sesi & Kenangan Abadi",
    description:
      "Datang ke studio privat kami yang nyaman. Fotografer kami memandu setiap pose dengan santai untuk mengabadikan momen autentik Anda.",
  },
];

export default function BookingProcess() {
  return (
    <section className="py-12 sm:py-20 lg:py-28 bg-[#161514] text-[#FCFAF6] relative overflow-hidden">
      {/* Decorative subtle ambient circle */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#262420] rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Alur Reservasi"
          title="Pengalaman Sesi Tanpa Kerumitan"
          description="Kami merancang seluruh proses pemesanan dengan cepat, transparan, dan terstruktur agar Anda bisa fokus menikmati setiap momen."
          isDark
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="relative bg-[#201F1D] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#B8976C]/60 hover:-translate-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-5 sm:mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#DFC9A8]">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="font-serif text-3xl font-light text-[#57534E]">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-normal text-white mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#A9A59E] font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
