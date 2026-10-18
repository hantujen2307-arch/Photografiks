"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Edit2,
  Trash2,
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PortfolioItem } from "@/types";
import { DEFAULT_PORTFOLIO } from "@/lib/constants";

const CATEGORIES = ["Portrait", "Couple", "Graduation", "Family", "Event", "Editorial"] as const;

export default function PortfolioClient() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("Portrait");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/portfolio");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil data portofolio.");
      if (data.items && data.items.length > 0) {
        setItems(data.items);
      } else {
        setItems(DEFAULT_PORTFOLIO);
      }
    } catch (err: unknown) {
      console.warn("Fallback to defaults:", err);
      setItems(DEFAULT_PORTFOLIO);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("Portrait");
    setDescription("");
    setIsFeatured(false);
    setSortOrder(items.length + 1);
    setFile(null);
    setImageUrl("");
    setPreviewUrl("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDescription(item.description || "");
    setIsFeatured(item.is_featured);
    setSortOrder(item.sort_order || 0);
    setFile(null);
    setImageUrl(item.image_url);
    setPreviewUrl(item.image_url);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        alert("File harus berformat gambar (JPG, PNG, WebP).");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("Ukuran gambar maksimal 10MB.");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setImageUrl(""); // Clear manual url when a file is selected
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("is_featured", String(isFeatured));
      formData.append("sort_order", String(sortOrder));

      if (file) {
        formData.append("file", file);
      } else if (imageUrl) {
        formData.append("image_url", imageUrl);
      } else if (editingItem) {
        formData.append("image_url", editingItem.image_url);
      } else {
        throw new Error("Pilih file foto atau masukkan URL foto.");
      }

      if (editingItem) {
        formData.append("id", editingItem.id);
        const res = await fetch("/api/admin/portfolio", {
          method: "PUT",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal memperbarui portofolio.");
        }

        // Instant optimistic state update
        if (data.item) {
          setItems((prev) =>
            prev.map((item) => (item.id === editingItem.id ? data.item : item))
          );
        }
        setSuccessMessage(`Foto dan data "${title}" berhasil diperbarui!`);
      } else {
        const res = await fetch("/api/admin/portfolio", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Gagal mengunggah foto.");
        }

        if (data.item) {
          setItems((prev) => [data.item, ...prev]);
        }
        setSuccessMessage(`Foto baru "${title}" berhasil diunggah!`);
      }

      setIsModalOpen(false);
      fetchItems();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan foto.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus foto portofolio ini? File pada Supabase Storage juga akan dihapus.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSuccessMessage("Foto portofolio berhasil dihapus.");
        setTimeout(() => setSuccessMessage(null), 4000);
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
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E1D5] shadow-xs">
        <div>
          <h2 className="font-serif text-2xl font-normal text-[#161514]">
            Koleksi Portofolio Studio
          </h2>
          <p className="text-xs text-[#6B6862] font-light mt-1">
            Upload langsung ke Supabase Storage atau sematkan URL foto resolusi tinggi.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-medium hover:bg-[#2A2926] transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Foto Baru</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Portfolio: 2-column on mobile, 3-column on desktop */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
          <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
          <span>Memuat galeri...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-[#E8E1D5] overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="relative aspect-[3/4] w-full bg-[#F4EFE6] overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    unoptimized={item.image_url.startsWith("blob:") || item.image_url.startsWith("data:")}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 300px"
                  />
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-xs text-[9px] sm:text-[10px] uppercase font-semibold text-white tracking-wider">
                      {item.category}
                    </span>
                    {item.is_featured && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-[#B8976C] text-[8px] sm:text-[9px] uppercase font-bold text-white tracking-wider">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] sm:text-[10px] text-[#9A8973] uppercase font-mono">
                      Urutan #{item.sort_order}
                    </span>
                  </div>
                  <h3 className="font-serif text-sm sm:text-base font-normal text-[#161514] truncate mb-1">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-[11px] sm:text-xs text-[#6B6862] font-light line-clamp-1 sm:line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-3 sm:p-4 pt-0 flex items-center justify-end gap-2 border-t border-[#F4EFE6] mt-2">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 sm:p-2 rounded-xl border border-[#E8E1D5] hover:bg-[#F4EFE6] text-[#161514] transition-colors"
                  title="Edit Rincian & Ganti Foto"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 sm:p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition-colors"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
              <div>
                <h3 className="font-serif text-2xl font-normal text-[#161514]">
                  {editingItem ? "Edit Portofolio & Ganti Foto" : "Upload Foto Portofolio"}
                </h3>
                <p className="text-xs text-[#6B6862] font-light mt-0.5">
                  Foto yang diunggah akan otomatis tersimpan di Supabase Storage &amp; Database.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#E8E1D5] flex items-center justify-center text-[#161514] hover:bg-[#F4EFE6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* File upload or preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold">
                    File Foto (Supabase Storage)
                  </label>
                  {file && (
                    <span className="text-[10px] text-emerald-600 font-medium">
                      File baru dipilih: {file.name} ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>

                {previewUrl ? (
                  <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#E8E1D5] mb-2 bg-black/5">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      unoptimized={previewUrl.startsWith("blob:") || previewUrl.startsWith("data:")}
                      className="object-contain"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <label className="cursor-pointer px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1.5 shadow-md active:scale-95 transition-transform">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Ganti File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl("");
                          setImageUrl("");
                        }}
                        className="p-1.5 rounded-full bg-black/70 text-white hover:bg-black"
                        title="Hapus foto"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#E8E1D5] rounded-2xl p-6 text-center hover:bg-[#FCFAF6] transition-colors">
                    <UploadCloud className="w-8 h-8 text-[#9A8973] mx-auto mb-2" />
                    <label className="cursor-pointer text-xs uppercase tracking-wider font-semibold text-[#161514] hover:underline block">
                      <span>Pilih Foto dari Perangkat</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-[#9A8973] block mt-1">
                      Format PNG, JPG, WEBP hingga 10MB
                    </span>
                  </div>
                )}

                <div className="mt-2 text-center text-[10px] text-[#9A8973] uppercase tracking-wider">
                  — ATAU GUNAKAN URL EKSTERNAL —
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value) setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 mt-1 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Judul Foto / Konsep *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Aura of Serenity"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                    Kategori *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                  Deskripsi Singkat / Catatan Konsep
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Penjelasan pencahayaan, konsep busana, atau emosi yang ingin disampaikan..."
                  className="w-full p-3 rounded-xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
                />
              </div>

              <div className="flex items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#161514]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#161514] accent-[#161514]"
                  />
                  <span>Tampilkan sebagai Karya Unggulan (Featured di Homepage)</span>
                </label>
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
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md active:scale-95"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunggah &amp; Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
