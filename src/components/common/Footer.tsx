import React from "react";
import Link from "next/link";
import { Camera, MessageCircle, Mail, MapPin, Clock, ArrowUpRight, ShieldCheck } from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import { createWhatsAppUrl } from "@/lib/utils";

export default function Footer({
  settings = DEFAULT_SITE_SETTINGS,
}: {
  settings?: typeof DEFAULT_SITE_SETTINGS;
}) {
  const waUrl = createWhatsAppUrl(
    settings.whatsapp_number,
    "Halo MOMEN.POTRAIT & Moment Grads Palembang, saya ingin konsultasi mengenai paket dan jadwal foto wisuda / portrait."
  );

  return (
    <footer className="bg-[#161514] text-[#FCFAF6] border-t border-[#232220] pt-12 sm:pt-20 pb-24 sm:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Upper Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 pb-10 sm:pb-16 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#FCFAF6] flex items-center justify-center text-[#161514]">
                <Camera className="w-4 h-4 stroke-[2]" />
              </div>
              <span className="font-serif text-xl tracking-[0.2em] font-medium uppercase text-[#FCFAF6]">
                Momen<span className="text-[#C9BBA7]">.</span>Potrait
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#A9A59E] max-w-md font-light">
              {settings.about_story}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href={`https://instagram.com/${settings.instagram_username.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-[#FCFAF6] hover:bg-white hover:text-[#161514] transition-all hover:scale-105"
                aria-label="Instagram MOMEN.POTRAIT"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-[#FCFAF6] hover:bg-[#25D366] hover:border-[#25D366] transition-all hover:scale-105"
                aria-label="WhatsApp Studio"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${settings.email_contact}`}
                className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-[#FCFAF6] hover:bg-white hover:text-[#161514] transition-all hover:scale-105"
                aria-label="Email Studio"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C9BBA7] font-semibold">
              Eksplorasi Layanan
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm font-light text-[#D5D0C7]">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-white transition-colors">
                  Galeri Portfolio
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-white transition-colors">
                  Paket Foto
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-white transition-colors">
                  Booking Sesi Foto
                </Link>
              </li>
              <li>
                <Link href="/booking/status" className="hover:text-white transition-colors">
                  Lacak Status Booking
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Kontak Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Visit & Operational Hours */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C9BBA7] font-semibold">
              Layanan &amp; Lokasi
            </h4>
            <div className="flex items-start gap-3 text-sm text-[#D5D0C7] font-light">
              <MapPin className="w-4 h-4 text-[#C9BBA7] shrink-0 mt-0.5" />
              <span>{settings.studio_address}</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-[#D5D0C7] font-light">
              <Clock className="w-4 h-4 text-[#C9BBA7] shrink-0 mt-0.5" />
              <span>{settings.operating_hours_text}</span>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-xs text-[#A9A59E] block mb-2">Konsultasi Konsep Sesi:</span>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[#C9BBA7] hover:text-white font-medium group"
              >
                <span>Konsultasi via WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#827E77] font-light">
          <p>
            &copy; 2026 MOMEN.POTRAIT &bull; Moment Grads Palembang. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 hover:text-[#C9BBA7] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
            <span>Serving Palembang &amp; Indralaya, South Sumatra</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
