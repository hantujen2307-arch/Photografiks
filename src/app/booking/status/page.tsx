"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  MessageCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { formatIDR, formatDateIndonesian, formatTimeShort, createWhatsAppUrl } from "@/lib/utils";
import { BookingStatus } from "@/types";

interface BookingLookupResult {
  booking_reference: string;
  customer_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  session_location: string;
  total_price: number;
  status: BookingStatus;
  package?: {
    name: string;
    duration_minutes: number;
  };
}

function StatusContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get("ref") || "";

  const [reference, setReference] = useState(initialRef);
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingLookupResult | null>(null);

  const fetchStatus = async (refVal: string, waVal?: string) => {
    if (!refVal.trim()) return;
    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      let url = `/api/bookings/status?ref=${encodeURIComponent(refVal.trim())}`;
      if (waVal && waVal.trim()) {
        url += `&wa=${encodeURIComponent(waVal.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Booking tidak ditemukan.");
      }

      setBooking(data.booking);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memuat status booking.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      fetchStatus(initialRef);
    }
  }, [initialRef]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(reference, whatsapp);
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terkonfirmasi</span>
          </div>
        );
      case "pending":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Konfirmasi Admin</span>
          </div>
        );
      case "completed":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Selesai (Completed)</span>
          </div>
        );
      case "cancelled":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Dibatalkan</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Lookup Search Form */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
              Nomor Referensi Booking
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. MP-202610-A8F2"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E1D5] text-sm uppercase tracking-wider font-mono focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
              Nomor WhatsApp Terdaftar (Opsional untuk Verifikasi)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="e.g. 081234567890"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !reference.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#161514] text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#DFC9A8]" />
                <span>Mencari Jadwal...</span>
              </>
            ) : (
              <>
                <span>Cari Status Reservasi</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 mb-8">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {booking && (
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-10 shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block mb-1">
                Status Pemesanan
              </span>
              <div className="font-mono text-xl sm:text-2xl font-bold text-[#161514]">
                {booking.booking_reference}
              </div>
            </div>
            <div>{getStatusBadge(booking.status)}</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-[#E8E1D5] text-xs font-light">
            <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
              <span className="text-[#9A8973] block mb-1">Klien Pemesan:</span>
              <strong className="text-sm font-medium text-[#161514]">
                {booking.customer_name}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
              <span className="text-[#9A8973] block mb-1">Paket Sesi:</span>
              <strong className="text-sm font-medium text-[#161514]">
                {booking.package?.name || "Sesi Foto Studio"}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
              <span className="text-[#9A8973] block mb-1">Tanggal Sesi:</span>
              <strong className="text-sm font-medium text-[#161514]">
                {formatDateIndonesian(booking.session_date)}
              </strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
              <span className="text-[#9A8973] block mb-1">Jam Sesi:</span>
              <strong className="text-sm font-medium text-[#161514]">
                {formatTimeShort(booking.start_time)} - {formatTimeShort(booking.end_time)} WIB
              </strong>
            </div>
          </div>

          <div className="py-6 border-b border-[#E8E1D5] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#9A8973]">Lokasi Studio:</span>
              <span className="font-medium text-[#161514]">
                {booking.session_location}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9A8973]">Total Investasi:</span>
              <span className="font-serif text-lg font-bold text-[#B8976C]">
                {formatIDR(booking.total_price)}
              </span>
            </div>
          </div>

          {/* Action assistance */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href={createWhatsAppUrl(
                "6281234567890",
                `Halo Admin MOMEN.POTRAIT, saya ingin menanyakan status booking *${booking.booking_reference}* atas nama *${booking.customer_name}*.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#20ba59] transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Hubungi Admin Studio</span>
            </a>

            <Link
              href="/booking"
              className="text-xs uppercase tracking-wider text-[#161514] font-medium hover:underline"
            >
              Reservasi Sesi Lain &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingStatusPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#FCFAF6]">
      <Navbar />

      <section className="pt-10 pb-12 bg-[#F4EFE6]/70 border-b border-[#E8E1D5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E1D5] mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9A8973]" />
            <span className="text-[11px] font-sans tracking-[0.2em] uppercase font-semibold text-[#846F54]">
              Reservation Tracker
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#161514] tracking-tight mb-3">
            Lacak Status Booking
          </h1>
          <p className="text-sm text-[#6B6862] font-light max-w-xl mx-auto leading-relaxed">
            Masukkan nomor referensi pesanan Anda untuk memeriksa status verifikasi jadwal dan instruksi sesi foto.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
                <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
                <span>Memuat formulir pelacakan...</span>
              </div>
            }
          >
            <StatusContent />
          </Suspense>
        </div>
      </section>

      <Footer />
    </main>
  );
}
