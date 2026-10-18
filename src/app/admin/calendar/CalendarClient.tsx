"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Unlock,
  X,
} from "lucide-react";
import { BusinessHours, BlockedDate, BlockedSlot, Booking } from "@/types";
import { formatTimeShort, formatDateIndonesian } from "@/lib/utils";

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];
const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function CalendarClient() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected date details
  const [selectedDate, setSelectedDate] = useState<string>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );

  // Block slot modal
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotStartTime, setSlotStartTime] = useState("12:00:00");
  const [slotEndTime, setSlotEndTime] = useState("13:30:00");
  const [slotReason, setSlotReason] = useState("Istirahat & Maintenance Studio");
  const [submitting, setSubmitting] = useState(false);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/calendar");
      const data = await res.json();
      if (res.ok) {
        setBusinessHours(data.businessHours || []);
        setBlockedDates(data.blockedDates || []);
        setBlockedSlots(data.blockedSlots || []);
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Fetch calendar error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Toggle blocking an entire date
  const handleToggleBlockDate = async (dateStr: string) => {
    const existing = blockedDates.find((b) => b.blocked_date === dateStr);
    try {
      if (existing) {
        // Unblock
        const res = await fetch(`/api/admin/calendar?type=date&id=${existing.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setBlockedDates((prev) => prev.filter((b) => b.id !== existing.id));
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.error || "Gagal membuka blokir tanggal.");
        }
      } else {
        // Block
        const res = await fetch("/api/admin/calendar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "block_date",
            date: dateStr,
            reason: "Tutup Studio",
          }),
        });
        const data = await res.json();
        if (res.ok && data.blockedDate) {
          setBlockedDates((prev) => [...prev, data.blockedDate]);
        } else {
          alert(data.error || "Gagal memblokir tanggal.");
        }
      }
    } catch (err) {
      console.error("Toggle block date error:", err);
      alert("Terjadi kesalahan saat memproses tanggal.");
    }
  };

  // Add custom blocked slot
  const handleAddBlockedSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "block_slot",
          date: selectedDate,
          start_time: slotStartTime,
          end_time: slotEndTime,
          reason: slotReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.blockedSlot) {
        setBlockedSlots((prev) => [...prev, data.blockedSlot]);
        setIsSlotModalOpen(false);
      } else {
        alert(data.error || "Gagal memblokir slot.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBlockedSlot = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/calendar?type=slot&id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlockedSlots((prev) => prev.filter((s) => s.id !== id));
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Gagal membuka blokir slot jam.");
      }
    } catch (err) {
      console.error("Delete slot error:", err);
      alert("Terjadi kesalahan saat menghapus blokir slot.");
    }
  };

  // Days calculations
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isBlocked = blockedDates.some((b) => b.blocked_date === dateStr);
    const dayBookings = bookings.filter((b) => b.session_date === dateStr);
    const dayBlockedSlots = blockedSlots.filter((s) => s.slot_date === dateStr);

    days.push({
      day: d,
      dateStr,
      isBlocked,
      isSelected: dateStr === selectedDate,
      bookingsCount: dayBookings.length,
      pendingCount: dayBookings.filter((b) => b.status === "pending").length,
      confirmedCount: dayBookings.filter((b) => b.status === "confirmed").length,
      blockedSlotsCount: dayBlockedSlots.length,
    });
  }

  // Selected date agenda
  const selectedDateBookings = bookings.filter((b) => b.session_date === selectedDate);
  const selectedDateBlockedSlots = blockedSlots.filter((s) => s.slot_date === selectedDate);
  const isSelectedDateBlocked = blockedDates.some((b) => b.blocked_date === selectedDate);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#161514]">
            Kalender &amp; Manajemen Slot Studio
          </h2>
          <p className="text-xs text-[#6B6862] font-light mt-1">
            Atur hari libur, blokir slot jam tertentu, atau tinjau jadwal sesi secara visual.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleBlockDate(selectedDate)}
            className={`px-4 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
              isSelectedDateBlocked
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-rose-600 text-white hover:bg-rose-700"
            }`}
          >
            {isSelectedDateBlocked ? (
              <span className="flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5" />
                <span>Buka Tanggal Ini</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>Tutup Tanggal Ini</span>
              </span>
            )}
          </button>

          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Blokir Slot Jam</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar & Day Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Monthly Calendar Grid */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F4EFE6]">
            <h3 className="font-serif text-2xl font-normal text-[#161514]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {DAY_NAMES.map((name, i) => (
              <span
                key={i}
                className="text-[11px] uppercase font-semibold text-[#9A8973]"
              >
                {name}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((item, idx) => {
              if (!item) return <div key={`empty-${idx}`} className="aspect-square" />;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => setSelectedDate(item.dateStr)}
                  className={`min-h-[70px] p-2 rounded-2xl border text-left flex flex-col justify-between transition-all relative ${
                    item.isSelected
                      ? "ring-2 ring-[#161514] bg-[#FCFAF6] border-[#161514]"
                      : item.isBlocked
                      ? "bg-rose-50/60 border-rose-200 text-rose-900"
                      : "bg-[#FCFAF6] border-[#E8E1D5] hover:bg-white text-[#161514]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-serif text-sm font-medium">
                      {item.day}
                    </span>
                    {item.isBlocked && (
                      <span className="text-[9px] uppercase font-bold text-rose-600">
                        Libur
                      </span>
                    )}
                  </div>

                  {/* Booking indicator pills */}
                  <div className="flex flex-col gap-1 w-full">
                    {item.confirmedCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-emerald-100 text-emerald-800 leading-none truncate">
                        {item.confirmedCount} Terkonfirmasi
                      </span>
                    )}
                    {item.pendingCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-amber-100 text-amber-800 leading-none truncate">
                        {item.pendingCount} Pending
                      </span>
                    )}
                    {item.blockedSlotsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold bg-neutral-200 text-neutral-700 leading-none truncate">
                        {item.blockedSlotsCount} Slot Diblokir
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#846F54]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Sesi Terkonfirmasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Menunggu Konfirmasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Studio Libur</span>
            </div>
          </div>
        </div>

        {/* Right: Selected Date Schedule & Blocked Slots */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F4EFE6]">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block mb-1">
                  Agenda Tanggal Terpilih
                </span>
                <h3 className="font-serif text-xl font-normal text-[#161514]">
                  {formatDateIndonesian(selectedDate)}
                </h3>
              </div>
              {isSelectedDateBlocked && (
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[10px] uppercase font-bold">
                  Status: Studio Tutup
                </span>
              )}
            </div>

            {/* Sesi Foto */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase tracking-wider text-[#846F54] font-semibold">
                Daftar Sesi Pemotretan ({selectedDateBookings.length})
              </h4>
              {selectedDateBookings.length === 0 ? (
                <p className="text-xs text-[#9A8973] font-light italic">
                  Tidak ada reservasi untuk tanggal ini.
                </p>
              ) : (
                selectedDateBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-medium text-[#161514]">
                        {b.customer_name}
                      </div>
                      <span className="text-[11px] text-[#846F54]">
                        {formatTimeShort(b.start_time)} - {formatTimeShort(b.end_time)} WIB
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Blocked Slots for this date */}
            <div className="space-y-3 pt-4 border-t border-[#F4EFE6]">
              <h4 className="text-xs uppercase tracking-wider text-[#846F54] font-semibold">
                Slot Jam Yang Diblokir ({selectedDateBlockedSlots.length})
              </h4>
              {selectedDateBlockedSlots.length === 0 ? (
                <p className="text-xs text-[#9A8973] font-light italic">
                  Tidak ada slot jam yang diblokir khusus pada tanggal ini.
                </p>
              ) : (
                selectedDateBlockedSlots.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-neutral-800">
                        {formatTimeShort(s.start_time)} - {formatTimeShort(s.end_time)} WIB
                      </div>
                      <span className="text-[11px] text-neutral-600">
                        {s.reason || "Diblokir"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteBlockedSlot(s.id)}
                      className="p-1 text-neutral-500 hover:text-red-600"
                      title="Buka blokir slot ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Block Slot Modal */}
      {isSlotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsSlotModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-[#E8E1D5] shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] mb-6">
              <h3 className="font-serif text-xl font-normal text-[#161514]">
                Blokir Slot Jam Khusus
              </h3>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlockedSlot} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    required
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    required
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Alasan Pemblokiran
                </label>
                <input
                  type="text"
                  required
                  value={slotReason}
                  onChange={(e) => setSlotReason(e.target.value)}
                  placeholder="e.g. Istirahat Tim Fotografer / Maintenance Lighting"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6]"
                />
              </div>

              <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E8E1D5] text-xs font-medium hover:bg-[#F4EFE6]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Kunci Slot Jam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
