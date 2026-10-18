"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PackageItem } from "@/types";
import { DEFAULT_PACKAGES } from "@/lib/constants";
import { formatIDR } from "@/lib/utils";

export default function PackagesClient() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [price, setPrice] = useState(850000);
  const [duration, setDuration] = useState(60);
  const [photoCountText, setPhotoCountText] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data paket.");
      if (data.packages && data.packages.length > 0) {
        setPackages(data.packages);
      } else {
        setPackages(DEFAULT_PACKAGES);
      }
    } catch (err: unknown) {
      console.warn("Fallback to defaults:", err);
      setPackages(DEFAULT_PACKAGES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPackage(null);
    setName("");
    setTagline("");
    setPrice(1000000);
    setDuration(60);
    setPhotoCountText("20 Foto Retouch + RAW");
    setFeaturesText("Sesi Studio Eksklusif\nPengarahan Pose Profesional\nGoogle Drive RAW Files");
    setIsActive(true);
    setSortOrder(packages.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setTagline(pkg.tagline || "");
    setPrice(pkg.price);
    setDuration(pkg.duration_minutes);
    setPhotoCountText(pkg.photo_count_text || "");
    setFeaturesText((pkg.features || []).join("\n"));
    setIsActive(pkg.is_active);
    setSortOrder(pkg.sort_order || 0);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const featuresArray = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name,
      tagline,
      price: Number(price),
      duration_minutes: Number(duration),
      photo_count_text: photoCountText,
      features: featuresArray,
      is_active: isActive,
      sort_order: Number(sortOrder),
    };

    try {
      if (editingPackage) {
        const res = await fetch("/api/admin/packages", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPackage.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");
      } else {
        const res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat paket.");
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (pkg: PackageItem) => {
    try {
      const res = await fetch("/api/admin/packages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pkg.id, is_active: !pkg.is_active }),
      });
      if (res.ok) {
        setPackages((prev) =>
          prev.map((p) => (p.id === pkg.id ? { ...p, is_active: !p.is_active } : p))
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (pkgId: string) => {
    if (!confirm("Hapus paket ini? Jika ada booking yang mereferensikannya, paket disarankan dinonaktifkan saja.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/packages?id=${pkgId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== pkgId));
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#161514]">
            Daftar Paket Fotografi
          </h2>
          <p className="text-xs text-[#6B6862] font-light mt-1">
            Paket yang aktif akan langsung muncul pada halaman publik dan formulir booking.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#2A2926] transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {/* Grid of Packages */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
          <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
          <span>Memuat paket...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                pkg.is_active ? "border-[#E8E1D5]" : "border-dashed border-[#E8E1D5] opacity-60 bg-[#FCFAF6]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#F4EFE6] text-[#846F54]">
                    Urutan #{pkg.sort_order}
                  </span>
                  <button
                    onClick={() => handleToggleActive(pkg)}
                    className="flex items-center gap-1.5 text-xs text-[#846F54] hover:text-[#161514]"
                    title="Klik untuk ubah status aktif"
                  >
                    {pkg.is_active ? (
                      <>
                        <span className="text-emerald-700 font-semibold text-[10px] uppercase">
                          Aktif
                        </span>
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                      </>
                    ) : (
                      <>
                        <span className="text-neutral-500 font-semibold text-[10px] uppercase">
                          Nonaktif
                        </span>
                        <ToggleLeft className="w-5 h-5 text-neutral-400" />
                      </>
                    )}
                  </button>
                </div>

                <h3 className="font-serif text-xl font-normal text-[#161514] mb-1">
                  {pkg.name}
                </h3>
                <p className="text-xs text-[#6B6862] font-light mb-4 min-h-[32px]">
                  {pkg.tagline}
                </p>

                <div className="flex items-baseline gap-2 mb-4 pb-4 border-b border-[#F4EFE6]">
                  <span className="font-serif text-2xl font-bold text-[#161514]">
                    {formatIDR(pkg.price)}
                  </span>
                  <span className="text-xs text-[#846F54] font-light">
                    / {pkg.duration_minutes} Menit
                  </span>
                </div>

                <div className="space-y-1.5 mb-6 text-xs text-[#4B4944] font-light">
                  <span className="text-[10px] uppercase tracking-wider text-[#9A8973] font-semibold block mb-1">
                    Fasilitas:
                  </span>
                  {pkg.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#B8976C] shrink-0 mt-0.5" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                  {pkg.features.length > 4 && (
                    <span className="text-[10px] text-[#9A8973] block italic">
                      + {pkg.features.length - 4} fasilitas lainnya
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#F4EFE6] flex items-center justify-end gap-2">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="p-2 rounded-xl border border-[#E8E1D5] hover:bg-[#F4EFE6] text-[#161514] transition-colors"
                  title="Edit Paket"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                  title="Hapus Paket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full border border-[#E8E1D5] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] mb-6">
              <h3 className="font-serif text-2xl font-normal text-[#161514]">
                {editingPackage ? "Edit Paket Fotografi" : "Tambah Paket Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Nama Paket *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Solo Editorial"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Deskripsi / Tagline Singkat
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Potret personal dengan estetika majalah fashion."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                    Harga (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                    Durasi Sesi (Menit) *
                  </label>
                  <input
                    type="number"
                    required
                    min={15}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Spesifikasi Foto Retouch &amp; RAW
                </label>
                <input
                  type="text"
                  value={photoCountText}
                  onChange={(e) => setPhotoCountText(e.target.value)}
                  placeholder="e.g. 25 Foto Retouch + Seluruh RAW Google Drive"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Daftar Fasilitas (Satu baris per fasilitas)
                </label>
                <textarea
                  rows={4}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="1 Orang / Sesi Personal&#10;60 Menit Sesi Studio Eksklusif&#10;Semua File Mentah RAW"
                  className="w-full p-3 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                    Urutan Tampil (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#161514]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#161514] accent-[#161514]"
                    />
                    <span>Paket Aktif &amp; Ditampilkan</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E1D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8E1D5] text-xs font-medium hover:bg-[#F4EFE6]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
