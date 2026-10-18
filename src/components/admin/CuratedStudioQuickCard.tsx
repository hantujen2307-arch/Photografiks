"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Settings,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface CuratedStudioQuickCardProps {
  currentHeroImage?: string;
}

const DEFAULT_HERO_IMAGE =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85";

export default function CuratedStudioQuickCard({
  currentHeroImage = DEFAULT_HERO_IMAGE,
}: CuratedStudioQuickCardProps) {
  const [activePhoto, setActivePhoto] = useState<string>(
    currentHeroImage?.trim() ? currentHeroImage.trim() : DEFAULT_HERO_IMAGE
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [photoSourceTab, setPhotoSourceTab] = useState<"upload" | "url">("upload");

  // Edit states inside modal
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(activePhoto);
  const [manualUrl, setManualUrl] = useState<string>(
    activePhoto.startsWith("blob:") ? "" : activePhoto
  );

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openModal = () => {
    setSelectedFile(null);
    setPreviewUrl(activePhoto);
    setManualUrl(activePhoto.startsWith("blob:") ? "" : activePhoto);
    setErrorMessage(null);
    setSaveSuccess(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setSelectedFile(null);
    setErrorMessage(null);
    setSaveSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File harus berformat gambar (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran gambar maksimal 10MB.");
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);
    setSelectedFile(null);
    if (url.trim().length > 0) {
      setPreviewUrl(url.trim());
    } else {
      setPreviewUrl(DEFAULT_HERO_IMAGE);
    }
  };

  const handleResetToDefault = () => {
    setSelectedFile(null);
    setManualUrl(DEFAULT_HERO_IMAGE);
    setPreviewUrl(DEFAULT_HERO_IMAGE);
    setErrorMessage(null);
  };

  const handleSavePhoto = async () => {
    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(null);

    try {
      let res: Response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("section", "general");
        formData.append("settings", JSON.stringify({}));
        formData.append("hero_image_file", selectedFile);

        res = await fetch("/api/admin/settings", {
          method: "PUT",
          body: formData,
        });
      } else {
        const finalUrl = manualUrl.trim() || previewUrl || DEFAULT_HERO_IMAGE;
        res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "general",
            settings: {
              hero_image_url: finalUrl,
            },
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan foto ke server.");
      }

      const newImageUrl = data.settings?.hero_image_url || previewUrl;
      setActivePhoto(newImageUrl);
      setSaveSuccess("Foto Curated Studio berhasil diperbarui & live di beranda!");

      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah foto."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Featured Quick Card on Overview Dashboard */}
      <div className="bg-gradient-to-br from-[#1E1C1A] to-[#141413] text-[#FCFAF6] rounded-3xl p-6 sm:p-7 shadow-lg border border-[#B8976C]/30 mb-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#B8976C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Thumbnail Preview with the EXACT Curated Studio Badge */}
          <div className="flex items-center gap-5 w-full md:w-auto">
            <div className="relative w-28 sm:w-32 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl shrink-0 bg-black/40 group">
              <Image
                src={activePhoto}
                alt="Foto Curated Studio"
                fill
                unoptimized
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                sizes="140px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Exact Circular Curated Studio Badge */}
              <div className="absolute top-2 right-2 w-11 h-11 rounded-full bg-[#161514] text-[#FCFAF6] p-1 flex flex-col items-center justify-center text-center shadow-lg border border-white/25 pointer-events-none">
                <Award className="w-2.5 h-2.5 text-[#B8976C] mb-0.2" />
                <span className="text-[5.5px] uppercase tracking-widest font-semibold text-[#DFC9A8] leading-none">
                  Curated
                </span>
                <span className="text-[5px] text-[#A9A59E] uppercase tracking-wider leading-none">
                  Studio
                </span>
              </div>

              {/* Micro caption */}
              <div className="absolute bottom-2 left-2 right-2 text-[8px] text-[#DFC9A8] font-medium leading-tight line-clamp-1 pointer-events-none">
                Moment Grads
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live di Beranda Utama
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-white">
                Foto Curated Studio
              </h3>
              <p className="text-xs text-[#A9A59E] font-light max-w-md leading-relaxed">
                Foto portrait utama berukuran besar yang tampil di samping judul beranda dengan lencana bundar <strong>Curated Studio</strong>.
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#B8976C] text-[#161514] font-semibold text-xs uppercase tracking-wider hover:bg-[#C9A87D] transition-colors shadow-md cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Ganti Foto Curated Studio</span>
            </button>

            <Link
              href="/admin/settings"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs uppercase tracking-wider font-medium border border-white/10 transition-colors"
            >
              <Settings className="w-3.5 h-3.5 text-[#DFC9A8]" />
              <span>Pengaturan Konten</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[#A9A59E] hover:text-white text-xs border border-white/5 transition-colors"
              title="Lihat Website Langsung"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Interactive Modal to Change the Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-[#FCFAF6] text-[#161514] rounded-3xl border border-[#E8E1D5] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E1D5] flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#161514] text-[#DFC9A8] flex items-center justify-center">
                  <Award className="w-5 h-5 text-[#B8976C]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-[#161514]">
                    Ganti Foto Curated Studio
                  </h3>
                  <p className="text-xs text-[#6B6862]">
                    Foto utama hero beranda MOMEN.POTRAIT (Rasio Portrait 4:5 / 3:4)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="w-9 h-9 rounded-full bg-[#F4EFE6] text-[#6B6862] hover:text-[#161514] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Notifications */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{saveSuccess}</span>
                </div>
              )}

              {/* Side-by-side: Live Preview & Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
                {/* Left: Preview with Curated Studio Badge */}
                <div className="sm:col-span-5 flex flex-col items-center">
                  <span className="text-[10px] uppercase tracking-wider text-[#9A8973] font-semibold mb-2 block">
                    Tampilan Live Preview
                  </span>
                  <div className="relative aspect-[3/4] w-full max-w-[210px] rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-[#EAE3D4]">
                    <Image
                      src={previewUrl}
                      alt="Curated Studio Preview"
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Exact Circular Badge Overlay */}
                    <div className="absolute top-2.5 right-2.5 w-14 h-14 rounded-full bg-[#161514] text-[#FCFAF6] p-1 flex flex-col items-center justify-center text-center shadow-lg border border-white/25 pointer-events-none">
                      <Award className="w-3.5 h-3.5 text-[#B8976C] mb-0.5" />
                      <span className="text-[7px] uppercase tracking-widest font-semibold text-[#DFC9A8]">
                        Curated
                      </span>
                      <span className="text-[6px] text-[#A9A59E] uppercase tracking-wider">
                        Studio
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                      <span className="text-[7px] tracking-[0.2em] uppercase font-semibold text-[#DFC9A8] block">
                        Moment Grads Palembang
                      </span>
                      <span className="font-serif text-[10px] leading-tight line-clamp-1">
                        Aesthetic, Natural &amp; Timeless
                      </span>
                    </div>

                    {selectedFile && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-semibold shadow-md">
                        File Baru
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Upload Options */}
                <div className="sm:col-span-7 space-y-4">
                  {/* Tab Selector */}
                  <div className="flex rounded-xl bg-[#EFECE6] p-1 gap-1">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab("upload")}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        photoSourceTab === "upload"
                          ? "bg-white text-[#161514] shadow-xs"
                          : "text-[#6B6862] hover:text-[#161514]"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab("url")}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        photoSourceTab === "url"
                          ? "bg-white text-[#161514] shadow-xs"
                          : "text-[#6B6862] hover:text-[#161514]"
                      }`}
                    >
                      Gunakan URL Gambar
                    </button>
                  </div>

                  {photoSourceTab === "upload" ? (
                    <div className="space-y-3">
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#B8976C] rounded-2xl bg-white hover:bg-[#F4EFE6] cursor-pointer transition-colors text-center group">
                        <div className="w-12 h-12 rounded-full bg-[#F4EFE6] group-hover:bg-[#EAE3D4] text-[#846F54] flex items-center justify-center mb-2 transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-[#161514] block">
                          Pilih foto dari komputer / ponsel
                        </span>
                        <span className="text-[11px] text-[#846F54] mt-1 block">
                          Format JPG, PNG, atau WebP (Maksimal 10MB)
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={saving}
                        />
                      </label>

                      {selectedFile && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E8E1D5] text-xs">
                          <div className="truncate max-w-[200px] font-mono text-[11px] text-[#161514]">
                            {selectedFile.name}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFile(null);
                              setPreviewUrl(activePhoto);
                            }}
                            className="text-rose-600 hover:underline text-[11px] font-semibold cursor-pointer"
                          >
                            Hapus File
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#4B4944]">
                        Tautan / URL Foto Langsung
                      </label>
                      <input
                        type="url"
                        value={manualUrl}
                        onChange={(e) => handleManualUrlChange(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        disabled={saving}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E1D5] bg-white text-xs text-[#161514] focus:outline-hidden focus:border-[#161514]"
                      />
                      <p className="text-[11px] text-[#846F54]">
                        Pastikan link URL dapat diakses publik via HTTPS.
                      </p>
                    </div>
                  )}

                  {/* Reset Option */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 text-[11px] text-[#846F54] hover:text-[#161514] underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Kembalikan ke Foto Default Studio</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-[#E8E1D5] bg-[#F4EFE6]/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-[#E8E1D5] bg-white text-[#161514] text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSavePhoto}
                disabled={saving || (photoSourceTab === "upload" && !selectedFile && previewUrl === activePhoto)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#161514] text-[#FCFAF6] text-xs font-semibold hover:bg-[#2A2926] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#DFC9A8]" />
                    <span>Menyimpan ke Storage...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#DFC9A8]" />
                    <span>Simpan &amp; Terapkan Foto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
