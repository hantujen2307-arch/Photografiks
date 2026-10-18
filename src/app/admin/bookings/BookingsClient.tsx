"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Clock,
  Eye,
  MessageCircle,
  Phone,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { Booking, BookingStatus } from "@/types";
import { formatIDR, formatDateIndonesian, formatTimeShort, createWhatsAppUrl } from "@/lib/utils";

export default function BookingsClient() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  const initialRef = searchParams.get("ref") || "";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState(initialRef);
  const [dateFilter, setDateFilter] = useState("");

  // Modal Detail
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/admin/bookings?status=${statusFilter}`;
      if (searchQuery.trim()) url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      if (dateFilter) url += `&date=${encodeURIComponent(dateFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data booking.");
      setBookings(data.bookings || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: newStatus,
          admin_notes: adminNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status.");

      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.id === selectedBooking.id ? { ...b, status: newStatus, admin_notes: adminNotes } : b))
      );
      setSelectedBooking((prev) => (prev ? { ...prev, status: newStatus, admin_notes: adminNotes } : null));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (b: Booking) => {
    setSelectedBooking(b);
    setAdminNotes(b.admin_notes || "");
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#9A8973] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode referensi, nama klien, atau no WhatsApp..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
          />
        </form>

        {/* Date Filter & Status Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] text-[#161514] focus:outline-hidden focus:border-[#161514]"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-[11px] text-[#846F54] hover:underline"
            >
              Reset Tanggal
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { key: "all", label: "Semua Status" },
          { key: "pending", label: "Pending (Menunggu)" },
          { key: "confirmed", label: "Confirmed (Disetujui)" },
          { key: "completed", label: "Completed (Selesai)" },
          { key: "cancelled", label: "Cancelled (Batal)" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all ${
              statusFilter === tab.key
                ? "bg-[#161514] text-white shadow-xs"
                : "bg-white text-[#6B6862] hover:bg-[#F4EFE6] border border-[#E8E1D5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
            <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
            <span>Memuat daftar booking...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 text-sm">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            <span>{error}</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center text-sm text-[#846F54]">
            Tidak ada reservasi yang sesuai dengan filter pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FCFAF6] border-b border-[#E8E1D5] text-[#9A8973] uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6 font-semibold">Kode Booking</th>
                  <th className="py-3.5 px-6 font-semibold">Klien &amp; Kontak</th>
                  <th className="py-3.5 px-6 font-semibold">Jadwal Sesi</th>
                  <th className="py-3.5 px-6 font-semibold">Total Investasi</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4EFE6]">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FCFAF6] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#161514]">
                      {b.booking_reference}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-serif text-sm font-medium text-[#161514]">
                        {b.customer_name}
                      </div>
                      <div className="text-[11px] text-[#6B6862] flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-[#9A8973]" />
                        <span>{b.customer_whatsapp}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-[#161514]">
                        {formatDateIndonesian(b.session_date)}
                      </div>
                      <div className="text-[11px] text-[#846F54] flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-[#B8976C]" />
                        <span>
                          {formatTimeShort(b.start_time)} - {formatTimeShort(b.end_time)} WIB
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-serif font-bold text-[#B8976C] text-sm">
                      {formatIDR(b.total_price)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
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
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => openDetail(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E1D5] hover:bg-[#161514] hover:text-white transition-all text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E1D5] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block mb-1">
                  Rincian Reservasi
                </span>
                <div className="font-mono text-xl font-bold text-[#161514]">
                  {selectedBooking.booking_reference}
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer & Session Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs font-light">
              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <span className="text-[#9A8973] block mb-1">Nama Pemesan:</span>
                <strong className="text-sm font-medium text-[#161514] block">
                  {selectedBooking.customer_name}
                </strong>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={createWhatsAppUrl(
                      selectedBooking.customer_whatsapp,
                      `Halo ${selectedBooking.customer_name}, admin MOMEN.POTRAIT menghubungi terkait pesanan foto #${selectedBooking.booking_reference}.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366] text-white text-[10px] font-semibold hover:bg-[#20ba59]"
                  >
                    <MessageCircle className="w-3 h-3 fill-white" />
                    <span>WhatsApp</span>
                  </a>
                  <span className="text-[#6B6862] font-mono">
                    {selectedBooking.customer_whatsapp}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <span className="text-[#9A8973] block mb-1">Jadwal Sesi:</span>
                <strong className="text-sm font-medium text-[#161514] block">
                  {formatDateIndonesian(selectedBooking.session_date)}
                </strong>
                <span className="text-[#846F54] block mt-1">
                  {formatTimeShort(selectedBooking.start_time)} -{" "}
                  {formatTimeShort(selectedBooking.end_time)} WIB
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <span className="text-[#9A8973] block mb-1">Lokasi Sesi:</span>
                <span className="text-[#161514] font-medium">
                  {selectedBooking.session_location}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6]">
                <span className="text-[#9A8973] block mb-1">Total Biaya Sesi:</span>
                <span className="font-serif text-lg font-bold text-[#B8976C]">
                  {formatIDR(selectedBooking.total_price)}
                </span>
              </div>
            </div>

            {selectedBooking.notes && (
              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#F4EFE6] text-xs mb-6">
                <span className="text-[#9A8973] block mb-1">Catatan dari Klien:</span>
                <p className="text-[#4B4944] italic">&ldquo;{selectedBooking.notes}&rdquo;</p>
              </div>
            )}

            {/* Admin Internal Notes */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Catatan Internal Studio (Admin Only)
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Misal: Sudah bayar DP 50%, fotografer: Raditya, backdrop: Cream editorial..."
                className="w-full p-3 rounded-xl border border-[#E8E1D5] text-xs focus:outline-hidden focus:border-[#161514] bg-[#FCFAF6]"
              />
            </div>

            {/* Status Change Buttons */}
            <div className="pt-4 border-t border-[#E8E1D5] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-[#9A8973] mr-2">Status Saat Ini:</span>
                <span className="font-bold uppercase text-[#161514]">
                  {selectedBooking.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {selectedBooking.status !== "confirmed" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus("confirmed")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold uppercase hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    Konfirmasi Sesi
                  </button>
                )}

                {selectedBooking.status !== "completed" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus("completed")}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold uppercase hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Tandai Selesai
                  </button>
                )}

                {selectedBooking.status !== "cancelled" && (
                  <button
                    disabled={actionLoading}
                    onClick={() => {
                      if (confirm("Yakin ingin membatalkan booking ini? Slot jam akan terbuka kembali.")) {
                        handleUpdateStatus("cancelled");
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold uppercase hover:bg-rose-700 transition-colors disabled:opacity-50"
                  >
                    Batalkan Pesanan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
