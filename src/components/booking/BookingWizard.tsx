"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  PackageItem,
  Booking,
} from "@/types";
import InteractiveCalendar from "./InteractiveCalendar";
import TimeSlotSelector from "./TimeSlotSelector";
import { formatIDR, formatDateIndonesian, formatTimeShort, createWhatsAppUrl } from "@/lib/utils";
import {
  Check,
  Clock,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  Copy,
} from "lucide-react";

interface BookingWizardProps {
  packages: PackageItem[];
  defaultSettingsWhatsapp?: string;
}

export default function BookingWizard({
  packages,
  defaultSettingsWhatsapp = "6281234567890",
}: BookingWizardProps) {
  const searchParams = useSearchParams();
  const preselectedPkgId = searchParams.get("package");

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    preselectedPkgId || (packages[0]?.id || "")
  );
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");

  const [customerName, setCustomerName] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [sessionLocation, setSessionLocation] = useState(
    "Studio MOMEN.POTRAIT (Senopati, Jakarta Selatan)"
  );
  const [notes, setNotes] = useState("");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const selectedPackage =
    packages.find((p) => p.id === selectedPackageId) || packages[0];

  const handleNextFromPackage = () => {
    if (!selectedPackageId) return;
    setCurrentStep(2);
  };

  const handleNextFromSchedule = () => {
    if (!selectedDate || !selectedStartTime) return;
    setCurrentStep(3);
  };

  const handleNextFromDetails = () => {
    if (!customerName.trim() || !customerWhatsapp.trim()) return;
    setCurrentStep(4);
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        package_id: selectedPackageId,
        session_date: selectedDate,
        start_time: selectedStartTime,
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        customer_email: customerEmail || undefined,
        session_location: sessionLocation,
        notes: notes || undefined,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses reservasi.");
      }

      setConfirmedBooking(data.booking);
      setCurrentStep(5);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Terjadi kesalahan sistem saat menyimpan booking.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReference = () => {
    if (confirmedBooking?.booking_reference) {
      navigator.clipboard.writeText(confirmedBooking.booking_reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // STEP 5: Success Receipt View
  if (currentStep === 5 && confirmedBooking) {
    const waText = `Halo MOMEN.POTRAIT, saya telah melakukan booking sesi foto dengan nomor referensi *${confirmedBooking.booking_reference}* atas nama *${confirmedBooking.customer_name}* untuk tanggal *${formatDateIndonesian(confirmedBooking.session_date)}* pukul *${formatTimeShort(confirmedBooking.start_time)} WIB*. Mohon konfirmasinya. Terima kasih!`;
    const waUrl = createWhatsAppUrl(defaultSettingsWhatsapp, waText);

    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-[#E8E1D5] shadow-xl p-8 sm:p-12 text-center animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-[#F4EFE6] text-[#161514] flex items-center justify-center mx-auto mb-6 shadow-xs">
          <CheckCircle2 className="w-8 h-8 text-[#B8976C]" />
        </div>

        <span className="text-[11px] font-sans tracking-[0.25em] uppercase font-semibold text-[#846F54] block mb-2">
          Permintaan Reservasi Terkirim
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#161514] mb-3">
          Terima Kasih, {confirmedBooking.customer_name}
        </h2>
        <p className="text-sm text-[#6B6862] font-light max-w-md mx-auto mb-8 leading-relaxed">
          Sistem kami telah mengamankan slot waktu Anda. Tim studio kami akan segera memverifikasi dan mengirimkan arahan konsep sesi.
        </p>

        {/* Reference Number Card */}
        <div className="bg-[#FCFAF6] border border-[#E8E1D5] rounded-2xl p-6 mb-8 text-left">
          <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block">
                Nomor Referensi Booking
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold text-[#161514] tracking-wider">
                {confirmedBooking.booking_reference}
              </span>
            </div>
            <button
              onClick={copyReference}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E8E1D5] text-xs text-[#161514] hover:bg-white transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedRef ? "Tersalin!" : "Salin"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
            <div>
              <span className="text-[#9A8973] block mb-0.5">Paket Sesi:</span>
              <span className="font-medium text-[#161514]">
                {selectedPackage?.name}
              </span>
            </div>
            <div>
              <span className="text-[#9A8973] block mb-0.5">Tanggal &amp; Waktu:</span>
              <span className="font-medium text-[#161514]">
                {formatDateIndonesian(confirmedBooking.session_date)} (
                {formatTimeShort(confirmedBooking.start_time)} WIB)
              </span>
            </div>
            <div>
              <span className="text-[#9A8973] block mb-0.5">Lokasi Sesi:</span>
              <span className="font-medium text-[#161514]">
                {confirmedBooking.session_location}
              </span>
            </div>
            <div>
              <span className="text-[#9A8973] block mb-0.5">Total Investasi:</span>
              <span className="font-semibold text-[#B8976C] text-sm">
                {formatIDR(confirmedBooking.total_price)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#25D366] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#20ba59] transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Konfirmasi ke WhatsApp Studio</span>
          </a>

          <Link
            href={`/booking/status?ref=${confirmedBooking.booking_reference}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-[#161514] text-[#161514] text-xs uppercase tracking-wider font-medium hover:bg-[#161514] hover:text-white transition-all"
          >
            <span>Lacak Status Booking</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Step Indicators */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E1D5] -translate-y-1/2 -z-10" />

          {[
            { step: 1, label: "Pilih Paket" },
            { step: 2, label: "Pilih Waktu" },
            { step: 3, label: "Data Diri" },
            { step: 4, label: "Ringkasan" },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div
                key={item.step}
                className="flex flex-col items-center gap-2 bg-[#FCFAF6] px-2"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCurrent
                      ? "bg-[#161514] text-white ring-4 ring-[#E8E1D5]"
                      : isCompleted
                      ? "bg-[#B8976C] text-white"
                      : "bg-[#E8E1D5] text-[#846F54]"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span
                  className={`text-[11px] font-sans uppercase tracking-wider ${
                    isCurrent
                      ? "font-bold text-[#161514]"
                      : "text-[#846F54] font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: Package Selection */}
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-200">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-normal text-[#161514] mb-2">
              Pilih Pengalaman Sesi Anda
            </h2>
            <p className="text-sm text-[#6B6862] font-light">
              Tentukan paket yang paling sesuai dengan jumlah orang dan konsep yang Anda inginkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {packages
              .filter((p) => p.is_active)
              .map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`cursor-pointer rounded-3xl p-6 sm:p-8 border transition-all duration-200 relative ${
                      isSelected
                        ? "bg-[#161514] text-white border-[#161514] shadow-xl scale-[1.01]"
                        : "bg-white text-[#161514] border-[#E8E1D5] hover:border-[#161514]/40"
                    }`}
                  >
                    {pkg.image_url && (
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 border border-current/10">
                        <Image
                          src={pkg.image_url}
                          alt={pkg.name}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-50" />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span
                          className={`text-[10px] tracking-[0.2em] uppercase font-semibold block mb-1 ${
                            isSelected ? "text-[#DFC9A8]" : "text-[#9A8973]"
                          }`}
                        >
                          {pkg.duration_minutes} Menit Sesi
                        </span>
                        <h3 className="font-serif text-2xl font-normal">
                          {pkg.name}
                        </h3>
                      </div>
                      <div className="font-serif text-2xl font-medium">
                        {formatIDR(pkg.price)}
                      </div>
                    </div>

                    <p
                      className={`text-xs font-light mb-6 ${
                        isSelected ? "text-[#C9BBA7]" : "text-[#6B6862]"
                      }`}
                    >
                      {pkg.tagline}
                    </p>

                    <div className="space-y-2 mb-6">
                      {pkg.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-light">
                          <Check
                            className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                              isSelected ? "text-[#DFC9A8]" : "text-[#9A8973]"
                            }`}
                          />
                          <span className={isSelected ? "text-white/90" : "text-[#4B4944]"}>
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end">
                      <span
                        className={`text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 ${
                          isSelected ? "text-[#DFC9A8]" : "text-[#161514]"
                        }`}
                      >
                        {isSelected ? "Paket Terpilih" : "Pilih Paket"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNextFromPackage}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#161514] text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] transition-all shadow-md"
            >
              <span>Lanjut ke Pilih Jadwal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Date & Slot Selection */}
      {currentStep === 2 && (
        <div className="animate-in fade-in duration-200">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-normal text-[#161514] mb-2">
              Tentukan Tanggal &amp; Jam Sesi
            </h2>
            <p className="text-sm text-[#6B6862] font-light">
              Paket: <strong className="text-[#161514]">{selectedPackage?.name}</strong> (
              {selectedPackage?.duration_minutes} Menit)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            <div className="lg:col-span-6">
              <InteractiveCalendar
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d);
                  setSelectedStartTime("");
                  setSelectedEndTime("");
                }}
              />
            </div>

            <div className="lg:col-span-6">
              <TimeSlotSelector
                date={selectedDate}
                packageId={selectedPackageId}
                durationMinutes={selectedPackage?.duration_minutes || 60}
                selectedTime={selectedStartTime}
                onSelectTime={(start, end) => {
                  setSelectedStartTime(start);
                  setSelectedEndTime(end);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#E8E1D5] text-[#161514] text-xs uppercase tracking-wider font-medium hover:bg-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              disabled={!selectedDate || !selectedStartTime}
              onClick={handleNextFromSchedule}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#161514] text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <span>Lanjut ke Data Diri</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Customer Details */}
      {currentStep === 3 && (
        <div className="animate-in fade-in duration-200 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-normal text-[#161514] mb-2">
              Lengkapi Informasi Anda
            </h2>
            <p className="text-sm text-[#6B6862] font-light">
              Data ini akan digunakan untuk mengirimkan konfirmasi reservasi dan koordinasi konsep foto.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-10 shadow-xs space-y-6 mb-10">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Nama Lengkap *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Jessica Alverina"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Nomor WhatsApp Aktif *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={customerWhatsapp}
                  onChange={(e) => setCustomerWhatsapp(e.target.value)}
                  placeholder="e.g. 081234567890"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                />
              </div>
              <span className="text-[11px] text-[#846F54] mt-1 block">
                Kami akan mengirimkan notifikasi jadwal dan link file foto melalui nomor ini.
              </span>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Alamat Email (Opsional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. jessica@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Preferensi Lokasi Sesi *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
                <select
                  value={sessionLocation}
                  onChange={(e) => setSessionLocation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                >
                  <option value="Studio MOMEN.POTRAIT (Senopati, Jakarta Selatan)">
                    Studio MOMEN.POTRAIT (Senopati, Jakarta Selatan)
                  </option>
                  <option value="Semi-Outdoor / Garden Studio">
                    Semi-Outdoor / Garden Studio
                  </option>
                  <option value="On-Location / Outdoor (Jakarta Area)">
                    On-Location / Outdoor (Area Jakarta)
                  </option>
                  <option value="Lokasi Klien (Rumah / Kantor / Venue Khusus)">
                    Lokasi Pribadi Klien (Rumah / Venue Khusus)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Catatan Khusus &amp; Referensi Konsep (Opsional)
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ceritakan jumlah peserta, tema warna pakaian yang direncanakan, atau hal penting lainnya..."
                  className="w-full p-4 rounded-xl border border-[#E8E1D5] text-sm focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#E8E1D5] text-[#161514] text-xs uppercase tracking-wider font-medium hover:bg-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              disabled={!customerName.trim() || !customerWhatsapp.trim()}
              onClick={handleNextFromDetails}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#161514] text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <span>Review Ringkasan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Confirmation */}
      {currentStep === 4 && (
        <div className="animate-in fade-in duration-200 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl font-normal text-[#161514] mb-2">
              Konfirmasi Permintaan Reservasi
            </h2>
            <p className="text-sm text-[#6B6862] font-light">
              Pastikan rincian sesi foto Anda di bawah ini sudah sesuai sebelum dikirim ke sistem studio.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-medium">Reservasi Belum Berhasil</strong>
                <span>{submitError}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-10 shadow-lg space-y-6 mb-10">
            {/* Header summary */}
            <div className="flex items-center justify-between pb-6 border-b border-[#E8E1D5]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block mb-1">
                  Paket Terpilih
                </span>
                <h3 className="font-serif text-2xl font-normal text-[#161514]">
                  {selectedPackage?.name}
                </h3>
                <span className="text-xs text-[#846F54]">
                  {selectedPackage?.duration_minutes} Menit Sesi Studio
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block mb-1">
                  Total Investasi
                </span>
                <span className="font-serif text-2xl font-bold text-[#161514]">
                  {formatIDR(selectedPackage?.price || 0)}
                </span>
              </div>
            </div>

            {/* Session details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <Calendar className="w-4 h-4 text-[#B8976C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#9A8973] block">Tanggal Sesi:</span>
                  <strong className="font-medium text-[#161514]">
                    {formatDateIndonesian(selectedDate)}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <Clock className="w-4 h-4 text-[#B8976C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#9A8973] block">Slot Jam Sesi:</span>
                  <strong className="font-medium text-[#161514]">
                    {formatTimeShort(selectedStartTime)} -{" "}
                    {formatTimeShort(selectedEndTime)} WIB
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <User className="w-4 h-4 text-[#B8976C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#9A8973] block">Nama Pemesan:</span>
                  <strong className="font-medium text-[#161514]">
                    {customerName}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <Phone className="w-4 h-4 text-[#B8976C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#9A8973] block">WhatsApp:</span>
                  <strong className="font-medium text-[#161514]">
                    {customerWhatsapp}
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6] text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#B8976C] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[#9A8973] block">Lokasi:</span>
                  <span className="text-[#161514]">{sessionLocation}</span>
                </div>
              </div>
              {notes && (
                <div className="flex items-start gap-3 mt-3 pt-3 border-t border-[#E8E1D5]/60">
                  <FileText className="w-4 h-4 text-[#B8976C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#9A8973] block">Catatan Tambahan:</span>
                    <span className="text-[#4B4944] italic">&ldquo;{notes}&rdquo;</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#F4EFE6] text-xs text-[#846F54] leading-relaxed">
              <strong>Aturan Pemesanan:</strong> Pembayaran DP atau pelunasan akan dikonfirmasikan oleh admin studio setelah nomor referensi diterbitkan. Slot Anda aman dan terlindungi secara atomik di sistem kami.
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E8E1D5]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-[#E8E1D5] text-[#161514] text-xs uppercase tracking-wider font-medium hover:bg-white transition-all disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Ubah Rincian</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitBooking}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#161514] text-white text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#DFC9A8]" />
                  <span>Mengunci Slot Jadwal...</span>
                </>
              ) : (
                <>
                  <span>Kirim Permintaan Booking</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
