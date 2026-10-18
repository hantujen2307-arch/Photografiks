import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatIDR, formatDateIndonesian, formatTimeShort } from "@/lib/utils";
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  ArrowRight,
  DollarSign,
} from "lucide-react";
import { Booking } from "@/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/constants";
import CuratedStudioQuickCard from "@/components/admin/CuratedStudioQuickCard";

export const metadata = {
  title: "Admin Overview | MOMEN.POTRAIT",
};

export default async function AdminOverviewPage() {
  const auth = await verifyAdminSession();

  if (!auth.isAuthenticated) {
    redirect("/admin/login");
  }

  let totalBookings = 0;
  let pendingCount = 0;
  let confirmedCount = 0;
  let todayCount = 0;
  let todayBookings: Booking[] = [];
  let recentBookings: Booking[] = [];
  let pendingQueue: Booking[] = [];
  let totalRevenue = 0;
  let heroImageUrl = DEFAULT_SITE_SETTINGS.hero_image_url;

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const supabase = await createServerSupabaseClient();

  if (supabase) {
    // 1. Fetch statistics and site settings concurrently
    const [bookingsRes, heroSettingRes] = await Promise.all([
      supabase
        .from("bookings")
        .select("*, package:packages(name)")
        .order("created_at", { ascending: false }),
      supabase
        .from("site_settings")
        .select("value")
        .eq("key", "hero_image_url")
        .maybeSingle(),
    ]);

    const allBookings = bookingsRes.data;
    if (allBookings) {
      totalBookings = allBookings.length;
      pendingCount = allBookings.filter((b) => b.status === "pending").length;
      confirmedCount = allBookings.filter((b) => b.status === "confirmed").length;
      todayBookings = allBookings.filter((b) => b.session_date === todayStr);
      todayCount = todayBookings.length;
      recentBookings = allBookings.slice(0, 5);
      pendingQueue = allBookings.filter((b) => b.status === "pending").slice(0, 4);

      totalRevenue = allBookings
        .filter((b) => b.status === "confirmed" || b.status === "completed")
        .reduce((acc, curr) => acc + Number(curr.total_price || 0), 0);
    }

    if (heroSettingRes?.data?.value) {
      let val = heroSettingRes.data.value;
      if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
        try {
          val = JSON.parse(val);
        } catch {}
      }
      if (typeof val === "string" && val.trim().length > 0) {
        heroImageUrl = val.trim();
      }
    }
  } else {
    // Mock preview values
    totalBookings = 18;
    pendingCount = 3;
    confirmedCount = 12;
    todayCount = 2;
    totalRevenue = 24500000;
  }

  return (
    <AdminLayoutClient
      title="Ringkasan Studio"
      userEmail={auth.user?.email}
      userRole={auth.user?.role}
      isDevBypass={auth.isDevBypass}
    >
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#9A8973] font-semibold block mb-1">
              Total Reservasi
            </span>
            <div className="font-serif text-3xl font-medium text-[#161514]">
              {totalBookings}
            </div>
            <span className="text-xs text-[#846F54] mt-1 block">Semua sesi tercatat</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] text-[#846F54] flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-amber-700 font-semibold block mb-1">
              Menunggu Konfirmasi
            </span>
            <div className="font-serif text-3xl font-medium text-amber-900">
              {pendingCount}
            </div>
            <span className="text-xs text-amber-600 mt-1 block">Perlu verifikasi admin</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-emerald-700 font-semibold block mb-1">
              Terkonfirmasi
            </span>
            <div className="font-serif text-3xl font-medium text-emerald-900">
              {confirmedCount}
            </div>
            <span className="text-xs text-emerald-600 mt-1 block">Jadwal siap terlaksana</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#846F54] font-semibold block mb-1">
              Estimasi Pendapatan
            </span>
            <div className="font-serif text-2xl font-bold text-[#161514]">
              {formatIDR(totalRevenue)}
            </div>
            <span className="text-xs text-[#846F54] mt-1 block">
              {todayCount} sesi aktif hari ini
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FCFAF6] text-[#B8976C] border border-[#E8E1D5] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Hero / Curated Studio Quick Management Card */}
      <CuratedStudioQuickCard currentHeroImage={heroImageUrl} />

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Pending Bookings Requiring Attention */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#F4EFE6]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-amber-700 font-bold block mb-1">
                Perlu Tindakan
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#161514]">
                Antrean Konfirmasi Booking
              </h3>
            </div>
            <Link
              href="/admin/bookings?status=pending"
              className="text-xs uppercase tracking-wider text-[#161514] font-semibold hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#846F54]">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <span>Tidak ada booking yang menunggu konfirmasi saat ini.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQueue.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#161514]">
                        {b.booking_reference}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-medium uppercase">
                        Pending
                      </span>
                    </div>
                    <h4 className="font-serif text-base text-[#161514] font-medium">
                      {b.customer_name}
                    </h4>
                    <span className="text-xs text-[#846F54]">
                      {formatDateIndonesian(b.session_date)} &bull; {formatTimeShort(b.start_time)} WIB
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-serif font-bold text-[#B8976C] mr-2">
                      {formatIDR(b.total_price)}
                    </span>
                    <Link
                      href={`/admin/bookings?ref=${b.booking_reference}`}
                      className="px-4 py-2 rounded-xl bg-[#161514] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#2A2926] transition-colors"
                    >
                      Periksa
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Today's Studio Agenda */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#F4EFE6]">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[#846F54] font-semibold block mb-1">
                Agenda Studio
              </span>
              <h3 className="font-serif text-2xl font-normal text-[#161514]">
                Jadwal Sesi Hari Ini
              </h3>
            </div>
            <span className="text-xs text-[#9A8973] font-mono">
              {formatDateIndonesian(todayStr)}
            </span>
          </div>

          {todayBookings.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#846F54]">
              <Calendar className="w-8 h-8 text-[#9A8973] mx-auto mb-2 opacity-60" />
              <span>Tidak ada jadwal pemotretan hari ini.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#161514] text-white flex flex-col items-center justify-center font-mono text-[10px]">
                      <span>{formatTimeShort(b.start_time)}</span>
                      <span className="text-[8px] text-[#DFC9A8]">WIB</span>
                    </div>
                    <div>
                      <h4 className="font-serif text-sm font-medium text-[#161514]">
                        {b.customer_name}
                      </h4>
                      <span className="text-[11px] text-[#846F54]">
                        {b.session_location}
                      </span>
                    </div>
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities / Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#F4EFE6]">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#846F54] font-semibold block mb-1">
              Catatan Masuk
            </span>
            <h3 className="font-serif text-2xl font-normal text-[#161514]">
              Aktivitas Reservasi Terbaru
            </h3>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs uppercase tracking-wider text-[#161514] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Buka Semua Booking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#846F54]">
            Belum ada aktivitas booking tercatat.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E1D5] text-[#9A8973] uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Referensi</th>
                  <th className="pb-3 font-semibold">Klien</th>
                  <th className="pb-3 font-semibold">WhatsApp</th>
                  <th className="pb-3 font-semibold">Tanggal Sesi</th>
                  <th className="pb-3 font-semibold">Jam</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE6]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FCFAF6] transition-colors">
                    <td className="py-3.5 font-mono font-medium text-[#161514]">
                      {b.booking_reference}
                    </td>
                    <td className="py-3.5 font-medium text-[#161514]">
                      {b.customer_name}
                    </td>
                    <td className="py-3.5 text-[#6B6862]">
                      {b.customer_whatsapp}
                    </td>
                    <td className="py-3.5 text-[#6B6862]">
                      {formatDateIndonesian(b.session_date)}
                    </td>
                    <td className="py-3.5 text-[#6B6862]">
                      {formatTimeShort(b.start_time)} WIB
                    </td>
                    <td className="py-3.5 font-serif font-bold text-[#B8976C]">
                      {formatIDR(b.total_price)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : b.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayoutClient>
  );
}
