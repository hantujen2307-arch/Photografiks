"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home, MessageCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center p-6 text-[#161514]">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E8E1D5] shadow-xl text-center space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#846F54] font-semibold block">
            Kendala Teknis
          </span>
          <h2 className="font-serif text-2xl font-normal text-[#161514]">
            Halaman Sedang Mengalami Kendala
          </h2>
          <p className="text-xs text-[#6B6862] leading-relaxed">
            Terjadi kendala saat memuat data studio. Anda dapat mencoba memuat ulang halaman atau menghubungi admin studio kami via WhatsApp.
          </p>
        </div>

        {error.message && process.env.NODE_ENV !== "production" && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-left text-[11px] font-mono text-red-800 break-all">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-[#D5CDBC] text-[#161514] text-xs uppercase tracking-wider font-semibold hover:bg-[#F4EFE6] transition-all active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ke Homepage</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-[#F4EFE6]">
          <a
            href="https://wa.me/6285157335443?text=Halo%20MOMEN.POTRAIT%2C%20saya%20mengalami%20kendala%20saat%20membuka%20website"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#1E7E34] hover:underline font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Butuh bantuan? Chat WhatsApp Kami</span>
          </a>
        </div>
      </div>
    </div>
  );
}
