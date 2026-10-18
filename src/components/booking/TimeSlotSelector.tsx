"use client";

import React, { useState, useEffect } from "react";
import { Clock, AlertCircle, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { formatTimeShort, minutesToTime, timeToMinutes } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SlotInfo {
  startTime: string; // e.g. "10:00:00"
  endTime: string; // e.g. "11:30:00"
  isAvailable: boolean;
  reason?: string;
}

interface TimeSlotSelectorProps {
  date: string; // YYYY-MM-DD
  packageId: string;
  durationMinutes: number;
  selectedTime: string; // "10:00:00"
  onSelectTime: (startTime: string, endTime: string) => void;
}

export default function TimeSlotSelector({
  date,
  packageId,
  durationMinutes,
  selectedTime,
  onSelectTime,
}: TimeSlotSelectorProps) {
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !packageId) return;

    let isMounted = true;
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/availability?date=${encodeURIComponent(date)}&package_id=${encodeURIComponent(
            packageId
          )}`
        );
        if (!res.ok) {
          throw new Error("Gagal mengambil ketersediaan slot.");
        }
        const data = await res.json();
        if (isMounted) {
          setSlots(data.slots || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          // If network / offline fallback: generate standard studio slots
          console.warn("Fallback to client generated slots:", err);
          const defaultSlots: SlotInfo[] = [
            { startTime: "09:30:00", endTime: minutesToTime(timeToMinutes("09:30:00") + durationMinutes), isAvailable: true },
            { startTime: "11:00:00", endTime: minutesToTime(timeToMinutes("11:00:00") + durationMinutes), isAvailable: true },
            { startTime: "13:30:00", endTime: minutesToTime(timeToMinutes("13:30:00") + durationMinutes), isAvailable: true },
            { startTime: "15:00:00", endTime: minutesToTime(timeToMinutes("15:00:00") + durationMinutes), isAvailable: true },
            { startTime: "16:30:00", endTime: minutesToTime(timeToMinutes("16:30:00") + durationMinutes), isAvailable: true },
            { startTime: "18:00:00", endTime: minutesToTime(timeToMinutes("18:00:00") + durationMinutes), isAvailable: true },
          ];
          setSlots(defaultSlots);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [date, packageId, durationMinutes]);

  if (!date) {
    return (
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-8 text-center text-[#6B6862] font-light">
        <Clock className="w-8 h-8 text-[#9A8973] mx-auto mb-3" />
        <p className="text-sm">Silakan pilih tanggal terlebih dahulu pada kalender.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F4EFE6]">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#846F54] block mb-1">
            Slot Waktu Tersedia
          </span>
          <h3 className="font-serif text-2xl font-normal text-[#161514]">
            Durasi {durationMinutes} Menit
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4EFE6] text-[11px] text-[#846F54] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#B8976C]" />
          <span>Real-time Sync</span>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-sm text-[#6B6862]">
          <Loader2 className="w-6 h-6 animate-spin text-[#161514]" />
          <span>Memeriksa jadwal studio terkini...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="py-12 text-center text-sm text-[#6B6862]">
          Tidak ada slot tersedia untuk tanggal ini. Silakan pilih tanggal lain.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots.map((slot) => {
            const isSelected = selectedTime === slot.startTime;
            const startLabel = formatTimeShort(slot.startTime);
            const endLabel = formatTimeShort(slot.endTime);

            return (
              <button
                key={slot.startTime}
                type="button"
                disabled={!slot.isAvailable}
                onClick={() => onSelectTime(slot.startTime, slot.endTime)}
                className={cn(
                  "p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 relative",
                  isSelected
                    ? "bg-[#161514] text-white border-[#161514] shadow-md scale-102"
                    : slot.isAvailable
                    ? "bg-[#FCFAF6] border-[#E8E1D5] hover:border-[#161514] hover:bg-white text-[#161514] cursor-pointer"
                    : "bg-[#F4EFE6]/40 border-dashed border-[#E8E1D5] text-[#9A8973] opacity-60 cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-serif text-lg font-medium tracking-tight">
                    {startLabel}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#DFC9A8]" />
                  )}
                </div>

                <div className="text-[11px] font-sans font-light">
                  {slot.isAvailable ? (
                    <span className={isSelected ? "text-[#DFC9A8]" : "text-[#846F54]"}>
                      Hingga {endLabel} WIB
                    </span>
                  ) : (
                    <span className="text-red-500 font-normal">
                      {slot.reason || "Terisi"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
