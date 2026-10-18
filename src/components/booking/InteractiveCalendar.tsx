"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  blockedDates?: string[]; // Array of YYYY-MM-DD
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function InteractiveCalendar({
  selectedDate,
  onSelectDate,
  blockedDates = [],
}: InteractiveCalendarProps) {
  // Current time in Asia/Jakarta
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

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

  // Generate days in current month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  // Empty slots before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    days.push({
      day,
      dateStr,
      isPast: dateStr < todayStr,
      isBlocked: blockedDates.includes(dateStr),
      isSelected: dateStr === selectedDate,
      isToday: dateStr === todayStr,
    });
  }

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] p-4 sm:p-6 sm:p-8 shadow-xs">
      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#F4EFE6]">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#846F54] block mb-0.5 sm:mb-1">
            Pilih Tanggal Sesi
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#161514]">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={
              currentYear === now.getFullYear() && currentMonth <= now.getMonth()
            }
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6] disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6] transition-colors active:scale-95"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 text-center">
        {DAY_NAMES.map((name, i) => (
          <span
            key={i}
            className="text-[10px] sm:text-[11px] font-sans uppercase tracking-wider text-[#9A8973] font-semibold py-0.5 sm:py-1"
          >
            {name}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((item, idx) => {
          if (!item) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const isDisabled = item.isPast || item.isBlocked;

          return (
            <button
              key={item.dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(item.dateStr)}
              className={cn(
                "aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all duration-200 relative",
                item.isSelected
                  ? "bg-[#161514] text-[#FCFAF6] shadow-md scale-105 z-10"
                  : isDisabled
                  ? "text-[#C9BBA7]/50 cursor-not-allowed bg-transparent"
                  : "text-[#161514] hover:bg-[#F4EFE6] hover:scale-105 cursor-pointer",
                item.isToday && !item.isSelected && "border border-[#B8976C] font-bold text-[#846F54]"
              )}
            >
              <span>{item.day}</span>
              {item.isToday && !item.isSelected && (
                <span className="w-1 h-1 rounded-full bg-[#B8976C] absolute bottom-1.5" />
              )}
              {item.isBlocked && !item.isPast && (
                <span className="text-[8px] uppercase tracking-tighter text-red-500 font-sans block leading-none">
                  Tutup
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-6 pt-4 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#846F54] font-light">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#161514]" />
          <span>Terpilih</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-[#B8976C]" />
          <span>Hari Ini</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E8E1D5]" />
          <span>Tidak Tersedia</span>
        </div>
      </div>
    </div>
  );
}
