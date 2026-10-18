"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import { PackageItem } from "@/types";
import { DEFAULT_PACKAGES } from "@/lib/constants";
import { formatIDR } from "@/lib/utils";

// Curated high-resolution studio photo presets for quick 1-click selection
const STUDIO_PHOTO_PRESETS = [
  {
    title: "Couple Intimate Story",
    category: "Couple",
    url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "The Solo Editorial",
    category: "Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Graduation Heritage",
    category: "Graduation",
    url: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Warm Family Generations",
    category: "Family",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Editorial Black & White",
    category: "Monochrome",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Natural Soft Light",
    category: "Portrait",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Modern Couple Fashion",
    category: "Couple",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Campus Graduation Joy",
    category: "Graduation",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
  },
];

export default function PackagesClient() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Photo Source Tab in Modal: 'upload' | 'presets' | 'url'
  const [photoSourceTab, setPhotoSourceTab] = useState<"upload" | "presets" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
    setImageUrl(STUDIO_PHOTO_PRESETS[0].url);
    setPrice(1000000);
    setDuration(60);
    setPhotoCountText("20 Foto Retouch + RAW Google Drive");
    setFeaturesText("Sesi Studio Eksklusif\nPengarahan Pose Profesional\nGoogle Drive RAW Files");
    setIsActive(true);
    setSortOrder(packages.length + 1);
    setPhotoSourceTab("upload");
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageItem) => {
    setEditingPackage(pkg);
    setName(pkg.name);
    setTagline(pkg.tagline || "");
    setImageUrl(pkg.image_url || "");
    setPrice(pkg.price);
    setDuration(pkg.duration_minutes);
    setPhotoCountText(pkg.photo_count_text || "");
    setFeaturesText((pkg.features || []).join("\n"));
    setIsActive(pkg.is_active);
    setSortOrder(pkg.sort_order || 0);
    setPhotoSourceTab("upload");
    setIsModalOpen(true);
  };

  // Handle local image file upload (converts to Data URL for instant storage & preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Harap pilih file gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(null);

    const featuresArray = featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name,
      tagline,
      image_url: imageUrl,
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
        if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan paket.");
        setSaveSuccess(`Paket "${name}" dan fotonya berhasil diperbarui!`);
      } else {
        const res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat paket baru.");
        setSaveSuccess(`Paket baru "${name}" berhasil dibuat dan disimpan!`);
      }

      setIsModalOpen(false);
      fetchPackages();

      // Clear success notification after 5 seconds
      setTimeout(() => setSaveSuccess(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan paket.");
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
    if (
      !confirm(
        "Hapus paket ini? Jika ada reservasi yang telah mereferensikan paket ini, disarankan untuk dinonaktifkan saja."
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/packages?id=${pkgId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== pkgId));
        setSaveSuccess("Paket berhasil dihapus.");
        setTimeout(() => setSaveSuccess(null), 4000);
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
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#161514]">
            Kelola Paket Fotografi &amp; Kartu Foto
          </h2>
          <p className="text-xs text-[#6B6862] font-light mt-1">
            Admin memiliki akses penuh untuk mengubah nama, harga, deskripsi, fasilitas, serta <strong>mengganti foto cover</strong> pada semua paket.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paket Baru</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveSuccess}</span>
        </div>
      )}

      {/* Package Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
          <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
          <span>Memuat daftar paket studio...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-xs flex flex-col justify-between transition-all hover:shadow-lg ${
                !pkg.is_active ? "opacity-60 bg-neutral-50" : ""
              }`}
            >
              <div>
                {/* Photo Card with Overlay & Quick Edit */}
                <div className="relative aspect-[16/10] w-full bg-[#F4EFE6] overflow-hidden group">
                  {pkg.image_url ? (
                    <Image
                      src={pkg.image_url}
                      alt={pkg.name}
                      fill
                      unoptimized={pkg.image_url.startsWith("data:")}
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#9A8973] gap-2">
                      <ImageIcon className="w-8 h-8 opacity-40" />
                      <span className="text-[11px] font-sans">Belum ada foto cover</span>
                    </div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] uppercase tracking-wider font-semibold text-white">
                      Urutan: #{pkg.sort_order || 0}
                    </span>

                    <button
                      onClick={() => handleToggleActive(pkg)}
                      className={`pointer-events-auto px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 transition-colors shadow-sm ${
                        pkg.is_active
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-neutral-600 text-white hover:bg-neutral-700"
                      }`}
                    >
                      {pkg.is_active ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Aktif</span>
                        </>
                      ) : (
                        <span>Nonaktif</span>
                      )}
                    </button>
                  </div>

                  {/* Hover Quick Edit Photo Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => openEditModal(pkg)}
                      className="px-4 py-2 rounded-full bg-white text-[#161514] text-xs font-semibold uppercase tracking-wider flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah Foto &amp; Paket</span>
                    </button>
                  </div>
                </div>

                {/* Package Card Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-[#161514]">
                      {pkg.name}
                    </h3>
                    {pkg.tagline && (
                      <p className="text-xs text-[#6B6862] font-light mt-0.5 line-clamp-2">
                        {pkg.tagline}
                      </p>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-[#F4EFE6]">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block">
                        Investasi Sesi
                      </span>
                      <span className="font-serif text-xl font-medium text-[#161514]">
                        {formatIDR(pkg.price)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider text-[#9A8973] block">
                        Durasi
                      </span>
                      <span className="text-xs font-medium text-[#161514]">
                        {pkg.duration_minutes} Menit
                      </span>
                    </div>
                  </div>

                  {pkg.features && pkg.features.length > 0 && (
                    <div className="pt-2 text-[11px] text-[#846F54] space-y-1">
                      {pkg.features.slice(0, 3).map((feat, i) => (
                        <div key={i} className="flex items-center gap-1.5 truncate">
                          <Check className="w-3 h-3 text-[#B8976C] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                      {pkg.features.length > 3 && (
                        <span className="text-[10px] text-[#9A8973] italic block">
                          +{pkg.features.length - 3} fasilitas lainnya
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="p-4 border-t border-[#E8E1D5] bg-[#FCFAF6] flex items-center justify-between">
                <button
                  onClick={() => openEditModal(pkg)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D5CDBC] text-xs font-medium text-[#161514] hover:bg-white transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>

                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Hapus Paket"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Tambah / Edit Paket Fotografi & Ubah Gambar */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full border border-[#E8E1D5] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* STICKY HEADER */}
            <div className="p-6 pb-4 border-b border-[#E8E1D5] flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="font-serif text-2xl font-normal text-[#161514]">
                  {editingPackage ? "Edit Paket Fotografi" : "Tambah Paket Baru"}
                </h3>
                <p className="text-xs text-[#6B6862] font-light mt-0.5">
                  Ubah data nama, harga, dan ganti foto kartu sesuai keinginan Anda.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6] transition-colors"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SCROLLABLE FORM BODY */}
            <form id="package-form" onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-5">
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
                  placeholder="e.g. Merayakan cinta, kehangatan, dan kedekatan dua hati dalam potret abadi."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              {/* FOTO COVER SECTION - 3 OPSI PRAKTIS */}
              <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs uppercase tracking-wider text-[#161514] font-semibold">
                    Foto Cover Kartu Paket
                  </label>
                  <span className="text-[10px] text-[#846F54] font-medium">
                    Pilih metode di bawah untuk mengganti foto
                  </span>
                </div>

                {/* Tab Pilihan Sumber Gambar */}
                <div className="flex items-center gap-1.5 bg-[#EAE3D4]/50 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab("upload")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      photoSourceTab === "upload"
                        ? "bg-white text-[#161514] shadow-xs font-semibold"
                        : "text-[#6B6862] hover:text-[#161514]"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Unggah File HP/Laptop</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab("presets")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      photoSourceTab === "presets"
                        ? "bg-white text-[#161514] shadow-xs font-semibold"
                        : "text-[#6B6862] hover:text-[#161514]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#B8976C]" />
                    <span>Pilih Preset Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab("url")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      photoSourceTab === "url"
                        ? "bg-white text-[#161514] shadow-xs font-semibold"
                        : "text-[#6B6862] hover:text-[#161514]"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Input Link URL</span>
                  </button>
                </div>

                {/* KONTEN TAB 1: UNGGAH DARI HP / LAPTOP */}
                {photoSourceTab === "upload" && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#D5CDBC] hover:border-[#161514] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white group"
                    >
                      <Upload className="w-8 h-8 text-[#9A8973] group-hover:text-[#161514] mx-auto mb-2 transition-colors" />
                      <span className="text-xs font-medium text-[#161514] block">
                        Klik di sini untuk memilih foto dari galeri HP atau komputer Anda
                      </span>
                      <span className="text-[10px] text-[#9A8973] mt-1 block">
                        Mendukung JPG, PNG, WEBP (Maksimal 8MB)
                      </span>
                    </div>
                  </div>
                )}

                {/* KONTEN TAB 2: PILIH PRESET FOTO STUDIO */}
                {photoSourceTab === "presets" && (
                  <div className="space-y-2">
                    <span className="text-[11px] text-[#6B6862] block">
                      Klik salah satu foto di bawah untuk langsung mengganti cover:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                      {STUDIO_PHOTO_PRESETS.map((preset, idx) => {
                        const isSelected = imageUrl === preset.url;
                        return (
                          <div
                            key={idx}
                            onClick={() => setImageUrl(preset.url)}
                            className={`relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                              isSelected
                                ? "border-[#161514] ring-2 ring-[#B8976C] scale-[0.98]"
                                : "border-transparent hover:border-[#846F54]"
                            }`}
                          >
                            <Image
                              src={preset.url}
                              alt={preset.title}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                              <span className="text-[9px] text-white font-medium truncate">
                                {preset.title}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#161514] text-white flex items-center justify-center">
                                <Check className="w-3 h-3 text-[#DFC9A8]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* KONTEN TAB 3: INPUT URL MANUAL */}
                {photoSourceTab === "url" && (
                  <div>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-white focus:outline-hidden focus:border-[#161514]"
                    />
                  </div>
                )}

                {/* PREVIEW FOTO YANG SEDANG DIGUNAKAN */}
                {imageUrl && (
                  <div className="mt-3 pt-3 border-t border-[#E8E1D5]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#161514] flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-[#846F54]" />
                        <span>Preview Gambar Terpilih</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-[11px] text-red-600 hover:underline font-medium"
                      >
                        Hapus Foto
                      </button>
                    </div>
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#E8E1D5] shadow-sm">
                      <Image
                        src={imageUrl}
                        alt="Preview Foto Cover Paket"
                        fill
                        unoptimized={imageUrl.startsWith("data:")}
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* HARGA & DURASI */}
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
                  placeholder="2 Orang (Couple Session)&#10;90 Menit Sesi Foto Studio&#10;25 Foto Retouch Resolusi Tinggi"
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
            </form>

            {/* STICKY FOOTER (ALWAYS VISIBLE & NEVER CUT OFF) */}
            <div className="p-4 px-6 border-t border-[#E8E1D5] bg-[#FCFAF6] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#846F54]">
                Perubahan foto dan data langsung aktif di website setelah disimpan.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8E1D5] text-xs font-medium hover:bg-white transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="package-form"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
