"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Package,
  Image as ImageIcon,
  CalendarDays,
  Settings,
  ExternalLink,
  LogOut,
  Camera,
  Shield,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Manajemen Booking", icon: CalendarCheck },
  { href: "/admin/packages", label: "Paket Sesi", icon: Package },
  { href: "/admin/portfolio", label: "Galeri Portofolio", icon: ImageIcon },
  { href: "/admin/calendar", label: "Kalender & Jadwal", icon: CalendarDays },
  { href: "/admin/settings", label: "Konten Website", icon: Settings },
];

export default function AdminSidebar({
  userEmail,
  userRole = "admin",
  isDevBypass = false,
}: {
  userEmail?: string;
  userRole?: string;
  isDevBypass?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-[#141413] text-[#FCFAF6] border-r border-white/10 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-full bg-white text-[#141413] flex items-center justify-center transition-transform group-hover:scale-105">
              <Camera className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <span className="font-serif text-base tracking-[0.2em] uppercase font-medium text-white block">
                MOMEN<span className="text-[#DFC9A8]">.</span>ADMIN
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#9A8973]">
                Studio Operations
              </span>
            </div>
          </Link>

          {isDevBypass && (
            <div className="mt-3 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-800/60 text-[10px] text-amber-300 font-mono flex items-center gap-1.5">
              <Shield className="w-3 h-3 shrink-0" />
              <span>Preview Mode (No Supabase Env)</span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-medium transition-all duration-150",
                  isActive
                    ? "bg-white text-[#141413] shadow-md font-semibold"
                    : "text-[#A9A59E] hover:text-white hover:bg-white/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    isActive ? "text-[#141413]" : "text-[#9A8973]"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer User Section */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#DFC9A8] transition-colors"
        >
          <span>Lihat Website Publik</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center justify-between px-2 pt-2 text-xs">
          <div className="truncate mr-2">
            <span className="block text-[11px] font-medium text-white truncate">
              {userEmail || "admin@momenpotrait.com"}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#846F54]">
              Role: {userRole}
            </span>
          </div>

          <button
            onClick={handleLogout}
            title="Keluar (Logout)"
            className="p-2 rounded-lg hover:bg-red-950/60 text-[#A9A59E] hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
