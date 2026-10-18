"use client";

import React, { useState, useEffect } from "react";
import { Clock, Menu, X } from "lucide-react";

export default function AdminHeader({
  title,
  onToggleMobileMenu,
  mobileMenuOpen,
}: {
  title: string;
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}) {
  const [timeStr, setTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Jakarta",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now) + " WIB"
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E8E1D5] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-[#161514] hover:bg-[#F4EFE6] rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <h1 className="font-serif text-xl sm:text-2xl font-normal text-[#161514]">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {timeStr && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCFAF6] border border-[#E8E1D5] text-xs font-mono text-[#846F54]">
            <Clock className="w-3.5 h-3.5 text-[#B8976C]" />
            <span>{timeStr}</span>
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 uppercase tracking-widest font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Live</span>
        </div>
      </div>
    </header>
  );
}
