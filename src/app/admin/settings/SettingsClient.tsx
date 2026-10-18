"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Lock,
  Shield,
  KeyRound,
  AlertCircle,
  Info,
  Upload,
  Image as ImageIcon,
  Award,
} from "lucide-react";
import { SiteSettings, TestimonialItem, FaqItem } from "@/types";
import { DEFAULT_SITE_SETTINGS, DEFAULT_TESTIMONIALS, DEFAULT_FAQS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "testimonials" | "faqs" | "security">("general");

  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Hero Images States for visual editing
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const [heroSecondaryFile, setHeroSecondaryFile] = useState<File | null>(null);
  const [heroSecondaryPreview, setHeroSecondaryPreview] = useState<string | null>(null);

  // Security / Password Change States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (res.ok) {
        if (data.settings) setSettings(data.settings);
        if (data.testimonials) setTestimonials(data.testimonials);
        if (data.faqs) setFaqs(data.faqs);
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("File harus berformat gambar (JPG, PNG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB.");
        return;
      }
      setHeroImageFile(file);
      setHeroImagePreview(URL.createObjectURL(file));
    }
  };

  const handleHeroSecondaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("File harus berformat gambar (JPG, PNG, WebP).");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran file maksimal 10MB.");
        return;
      }
      setHeroSecondaryFile(file);
      setHeroSecondaryPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      let res: Response;
      if (heroImageFile || heroSecondaryFile) {
        const formData = new FormData();
        formData.append("section", "general");
        formData.append("settings", JSON.stringify(settings));
        if (heroImageFile) formData.append("hero_image_file", heroImageFile);
        if (heroSecondaryFile) formData.append("hero_secondary_image_file", heroSecondaryFile);

        res = await fetch("/api/admin/settings", {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "general", settings }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan.");
      }

      if (data.settings) {
        setSettings((prev) => ({ ...prev, ...data.settings }));
      }
      setHeroImageFile(null);
      setHeroImagePreview(null);
      setHeroSecondaryFile(null);
      setHeroSecondaryPreview(null);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTestimonials = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "testimonials", testimonials }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan testimoni.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFaqs = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "faqs", faqs }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan FAQ.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const addTestimonial = () => {
    const newT: TestimonialItem = {
      id: "new-" + Date.now(),
      client_name: "Nama Klien Baru",
      client_role: "Portrait Session",
      content: "Pengalaman foto studio yang sangat memuaskan dan berkesan.",
      rating: 5,
      is_active: true,
      sort_order: testimonials.length + 1,
    };
    setTestimonials([...testimonials, newT]);
  };

  const addFaq = () => {
    const newF: FaqItem = {
      id: "new-" + Date.now(),
      question: "Pertanyaan Baru?",
      answer: "Jawaban penjelasan untuk klien MOMEN.POTRAIT...",
      category: "General",
      is_active: true,
      sort_order: faqs.length + 1,
    };
    setFaqs([...faqs, newF]);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newPassword.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui kata sandi.");
      }

      // Also update Supabase if connected
      const supabase = createClient();
      if (supabase) {
        try {
          await supabase.auth.updateUser({ password: newPassword.trim() });
        } catch {
          // ignore
        }
      }

      setPasswordSuccess(
        "Kata sandi administrator berhasil diperbarui! Silakan gunakan kata sandi baru ini untuk login berikutnya."
      );
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengganti password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E1D5]">
        {[
          { key: "general", label: "Beranda, Foto Hero & Headline" },
          { key: "contact", label: "Kontak & Media Sosial" },
          { key: "testimonials", label: "Testimoni Klien" },
          { key: "faqs", label: "Tanya Jawab (FAQ)" },
          { key: "security", label: "Keamanan & Password" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-5 py-2.5 rounded-2xl text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-[#161514] text-white shadow-xs"
                : "bg-white text-[#6B6862] hover:bg-[#F4EFE6] border border-[#E8E1D5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Perubahan konten &amp; foto hero berhasil disimpan ke database studio.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: General & Headline */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs space-y-8">
          <div className="border-b border-[#F4EFE6] pb-4">
            <h3 className="font-serif text-xl font-normal text-[#161514]">
              Headline &amp; Teks Hero Homepage
            </h3>
            <p className="text-xs text-[#6B6862] font-light mt-1">
              Pesan utama yang akan langsung dibaca oleh pengunjung saat membuka MOMEN.POTRAIT.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Headline Utama (Hero Title)
              </label>
              <input
                type="text"
                required
                value={settings.hero_headline}
                onChange={(e) => setSettings({ ...settings, hero_headline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] font-serif focus:outline-hidden focus:border-[#161514]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Deskripsi Singkat (Hero Subheadline)
              </label>
              <textarea
                rows={3}
                required
                value={settings.hero_subheadline}
                onChange={(e) => setSettings({ ...settings, hero_subheadline: e.target.value })}
                className="w-full p-4 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
              />
            </div>
          </div>

          {/* Section: Foto Visual Hero */}
          <div className="pt-6 border-t border-[#F4EFE6] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#846F54]" />
                  <h4 className="font-serif text-xl font-normal text-[#161514]">
                    Foto Visual Hero (Halaman Utama)
                  </h4>
                </div>
                <p className="text-xs text-[#6B6862] font-light mt-1">
                  Ubah kedua foto awalan pada tampilan beranda website: Foto Utama Portrait dan Foto Kartu Melayang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Foto Curated Studio (Foto Utama Beranda / Hero) */}
              <div className="p-5 rounded-2xl bg-[#FCFAF6] border-2 border-[#B8976C]/40 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#B8976C]" />
                      <span className="text-xs uppercase tracking-wider font-bold text-[#161514]">
                        1. Foto Curated Studio (Hero Beranda)
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#161514] text-[#DFC9A8] font-semibold">
                      Curated Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6862] mb-4">
                    Foto portrait berukuran besar di samping judul beranda dengan lencana bundar <strong>Curated Studio</strong>.
                  </p>

                  {/* Visual Preview */}
                  <div className="relative aspect-[4/5] w-full max-w-[260px] mx-auto rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-[#EFECE6] mb-4">
                    <Image
                      src={
                        heroImagePreview ||
                        settings.hero_image_url ||
                        DEFAULT_SITE_SETTINGS.hero_image_url ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85"
                      }
                      alt="Preview Foto Curated Studio"
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                    {/* Exact Circular Curated Studio Badge */}
                    <div className="absolute top-2.5 right-2.5 w-14 h-14 rounded-full bg-[#161514] text-[#FCFAF6] p-1 flex flex-col items-center justify-center text-center shadow-lg border border-white/25 pointer-events-none">
                      <Award className="w-3.5 h-3.5 text-[#B8976C] mb-0.5" />
                      <span className="text-[7px] uppercase tracking-widest font-semibold text-[#DFC9A8]">
                        Curated
                      </span>
                      <span className="text-[6px] text-[#A9A59E] uppercase tracking-wider">
                        Studio
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                      <span className="text-[8px] tracking-[0.2em] uppercase font-semibold text-[#DFC9A8] block">
                        Moment Grads Palembang
                      </span>
                      <span className="font-serif text-xs line-clamp-1">
                        Aesthetic, Natural &amp; Timeless Memories
                      </span>
                    </div>
                    {heroImageFile && (
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-semibold shadow-md">
                        Foto Baru Terpilih
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#E8E1D5]/60">
                  {/* File Upload Trigger */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4B4944] font-semibold mb-1.5">
                      Ganti Foto (Upload File)
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#B8976C] bg-white hover:bg-[#F4EFE6] cursor-pointer text-xs font-medium text-[#161514] transition-colors shadow-xs">
                      <Upload className="w-4 h-4 text-[#846F54]" />
                      <span>{heroImageFile ? "Ganti File Dipilih" : "Pilih Foto dari Perangkat"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleHeroImageChange}
                      />
                    </label>
                    {heroImageFile && (
                      <div className="flex items-center justify-between text-[11px] text-[#6B6862] mt-1.5 px-1 bg-white p-1.5 rounded-lg border border-[#E8E1D5]">
                        <span className="truncate max-w-[180px] font-mono text-[10px]">{heroImageFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setHeroImageFile(null);
                            setHeroImagePreview(null);
                          }}
                          className="text-red-500 hover:underline cursor-pointer text-[10px] font-semibold"
                        >
                          Hapus Pilihan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                      Atau URL Foto Langsung
                    </label>
                    <input
                      type="url"
                      value={settings.hero_image_url || ""}
                      onChange={(e) => {
                        setHeroImagePreview(null);
                        setHeroImageFile(null);
                        setSettings({ ...settings, hero_image_url: e.target.value });
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs bg-white focus:outline-hidden focus:border-[#161514]"
                    />
                  </div>

                  {settings.hero_image_url && settings.hero_image_url !== DEFAULT_SITE_SETTINGS.hero_image_url && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeroImageFile(null);
                        setHeroImagePreview(null);
                        setSettings({
                          ...settings,
                          hero_image_url: DEFAULT_SITE_SETTINGS.hero_image_url,
                        });
                      }}
                      className="text-[11px] text-[#9A8973] hover:text-[#161514] underline text-left block cursor-pointer"
                    >
                      Kembalikan ke Foto Default Studio
                    </button>
                  )}
                </div>
              </div>

              {/* Card 2: Foto Kartu Melayang (Couple Story) */}
              <div className="p-5 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#161514]">
                      2. Foto Kartu Melayang (Couple Story)
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#EAE3D4] text-[#6B6862]">
                      Rasio 4:5
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B6862] mb-4">
                    Foto thumbnail melayang di sudut kiri bawah foto utama beranda.
                  </p>

                  {/* Visual Preview */}
                  <div className="relative aspect-[4/5] w-full max-w-[200px] mx-auto rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-[#EFECE6] mb-4">
                    <Image
                      src={
                        heroSecondaryPreview ||
                        settings.hero_secondary_image_url ||
                        DEFAULT_SITE_SETTINGS.hero_secondary_image_url ||
                        "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=600&q=80"
                      }
                      alt="Preview Foto Kartu Melayang"
                      fill
                      unoptimized
                      className="object-cover object-center"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs py-1 px-2 rounded text-[9px] text-white tracking-widest uppercase text-center font-sans pointer-events-none">
                      Graduation Story
                    </div>
                    {heroSecondaryFile && (
                      <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-semibold shadow-md">
                        Foto Baru Terpilih
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#E8E1D5]/60">
                  {/* File Upload Trigger */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4B4944] font-semibold mb-1.5">
                      Ganti Foto (Upload File)
                    </label>
                    <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#B8976C] bg-white hover:bg-[#F4EFE6] cursor-pointer text-xs font-medium text-[#161514] transition-colors shadow-xs">
                      <Upload className="w-4 h-4 text-[#846F54]" />
                      <span>{heroSecondaryFile ? "Ganti File Dipilih" : "Pilih Foto dari Perangkat"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleHeroSecondaryChange}
                      />
                    </label>
                    {heroSecondaryFile && (
                      <div className="flex items-center justify-between text-[11px] text-[#6B6862] mt-1.5 px-1 bg-white p-1.5 rounded-lg border border-[#E8E1D5]">
                        <span className="truncate max-w-[180px] font-mono text-[10px]">{heroSecondaryFile.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setHeroSecondaryFile(null);
                            setHeroSecondaryPreview(null);
                          }}
                          className="text-red-500 hover:underline cursor-pointer text-[10px] font-semibold"
                        >
                          Hapus Pilihan
                        </button>
                      </div>
                    )}
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#4B4944] font-semibold mb-1">
                      Atau URL Foto Langsung
                    </label>
                    <input
                      type="url"
                      value={settings.hero_secondary_image_url || ""}
                      onChange={(e) => {
                        setHeroSecondaryPreview(null);
                        setHeroSecondaryFile(null);
                        setSettings({ ...settings, hero_secondary_image_url: e.target.value });
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs bg-white focus:outline-hidden focus:border-[#161514]"
                    />
                  </div>

                  {settings.hero_secondary_image_url && settings.hero_secondary_image_url !== DEFAULT_SITE_SETTINGS.hero_secondary_image_url && (
                    <button
                      type="button"
                      onClick={() => {
                        setHeroSecondaryFile(null);
                        setHeroSecondaryPreview(null);
                        setSettings({
                          ...settings,
                          hero_secondary_image_url: DEFAULT_SITE_SETTINGS.hero_secondary_image_url,
                        });
                      }}
                      className="text-[11px] text-[#9A8973] hover:text-[#161514] underline text-left block cursor-pointer"
                    >
                      Kembalikan ke Foto Default Studio
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F4EFE6] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan & Mengunggah Foto..." : "Simpan Perubahan & Foto Hero"}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Contact & Socials */}
      {activeTab === "contact" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F4EFE6] pb-4">
            <h3 className="font-serif text-xl font-normal text-[#161514]">
              Kontak Studio &amp; Akun Media Sosial
            </h3>
            <p className="text-xs text-[#6B6862] font-light mt-1">
              Nomor WhatsApp di bawah ini digunakan untuk semua tombol chat publik dan konfirmasi booking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Nomor WhatsApp Resmi (Contoh: 6285157335443) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsapp_number}
                onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] font-mono focus:outline-hidden focus:border-[#161514]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Username Instagram *
              </label>
              <input
                type="text"
                required
                value={settings.instagram_username}
                onChange={(e) => setSettings({ ...settings, instagram_username: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Email Resmi Studio
              </label>
              <input
                type="email"
                required
                value={settings.email_contact}
                onChange={(e) => setSettings({ ...settings, email_contact: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
                Teks Jam Operasional (Footer &amp; Kontak)
              </label>
              <input
                type="text"
                value={settings.operating_hours_text}
                onChange={(e) => setSettings({ ...settings, operating_hours_text: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#4B4944] font-semibold mb-2">
              Alamat Lengkap Studio
            </label>
            <textarea
              rows={2}
              value={settings.studio_address}
              onChange={(e) => setSettings({ ...settings, studio_address: e.target.value })}
              className="w-full p-4 rounded-xl border border-[#E8E1D5] text-sm bg-[#FCFAF6] focus:outline-hidden focus:border-[#161514]"
            />
          </div>

          <div className="pt-4 border-t border-[#F4EFE6] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Kontak"}</span>
            </button>
          </div>
        </form>
      )}



      {/* TAB 4: Testimonials */}
      {activeTab === "testimonials" && (
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#161514]">
                Kelola Testimoni Klien
              </h3>
              <p className="text-xs text-[#6B6862] font-light mt-1">
                Ubah atau tambah ulasan asli dari klien yang telah melakukan pemotretan.
              </p>
            </div>
            <button
              onClick={addTestimonial}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#161514] text-xs font-semibold uppercase hover:bg-[#161514] hover:text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Ulasan</span>
            </button>
          </div>

          <div className="space-y-4">
            {testimonials.map((t, idx) => (
              <div key={t.id || idx} className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={t.client_name}
                    onChange={(e) => {
                      const updated = [...testimonials];
                      updated[idx].client_name = e.target.value;
                      setTestimonials(updated);
                    }}
                    placeholder="Nama Klien"
                    className="px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs bg-white font-medium"
                  />
                  <input
                    type="text"
                    value={t.client_role || ""}
                    onChange={(e) => {
                      const updated = [...testimonials];
                      updated[idx].client_role = e.target.value;
                      setTestimonials(updated);
                    }}
                    placeholder="Role (e.g. Wisudawan UI)"
                    className="px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs bg-white"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs text-[#846F54]">Rating: 5★</span>
                    <button
                      onClick={() => setTestimonials(testimonials.filter((_, i) => i !== idx))}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={t.content}
                  onChange={(e) => {
                    const updated = [...testimonials];
                    updated[idx].content = e.target.value;
                    setTestimonials(updated);
                  }}
                  placeholder="Isi testimoni klien..."
                  className="w-full p-3 rounded-xl border border-[#E8E1D5] text-xs bg-white leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F4EFE6] flex justify-end">
            <button
              onClick={handleSaveTestimonials}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Testimoni"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: FAQs */}
      {activeTab === "faqs" && (
        <div className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
            <div>
              <h3 className="font-serif text-xl font-normal text-[#161514]">
                Kelola Tanya Jawab (FAQ)
              </h3>
              <p className="text-xs text-[#6B6862] font-light mt-1">
                Pertanyaan yang sering diajukan seputar alur booking, reschedule, dan pengiriman file.
              </p>
            </div>
            <button
              onClick={addFaq}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#161514] text-xs font-semibold uppercase hover:bg-[#161514] hover:text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pertanyaan</span>
            </button>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => (
              <div key={f.id || idx} className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#E8E1D5] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <input
                    type="text"
                    value={f.question}
                    onChange={(e) => {
                      const updated = [...faqs];
                      updated[idx].question = e.target.value;
                      setFaqs(updated);
                    }}
                    placeholder="Pertanyaan?"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8E1D5] text-xs bg-white font-medium"
                  />
                  <button
                    onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={f.answer}
                  onChange={(e) => {
                    const updated = [...faqs];
                    updated[idx].answer = e.target.value;
                    setFaqs(updated);
                  }}
                  placeholder="Jawaban rinci..."
                  className="w-full p-3 rounded-xl border border-[#E8E1D5] text-xs bg-white leading-relaxed"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#F4EFE6] flex justify-end">
            <button
              onClick={handleSaveFaqs}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan FAQ"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Keamanan & Password */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <form
            onSubmit={handleChangePassword}
            className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs space-y-6 max-w-2xl"
          >
            <div className="border-b border-[#F4EFE6] pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4EFE6] text-[#846F54] flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-medium text-[#161514]">
                  Ganti Kata Sandi (Password) Admin
                </h3>
                <p className="text-xs text-[#6B6862] font-light mt-0.5">
                  Perbarui kata sandi akun administrator studio MOMEN.POTRAIT Anda secara aman.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A8973] font-semibold mb-2">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#846F54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:bg-white focus:outline-hidden focus:border-[#846F54] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9A8973] font-semibold mb-2">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#846F54] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E1D5] text-xs bg-[#FCFAF6] focus:bg-white focus:outline-hidden focus:border-[#846F54] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#F4EFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-[11px] text-[#9A8973]">
                Pastikan kata sandi baru minimal 6 karakter dan mudah diingat.
              </span>
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{passwordLoading ? "Menyimpan..." : "Perbarui Kata Sandi"}</span>
              </button>
            </div>
          </form>

          {/* Security Information Card */}
          <div className="p-6 rounded-3xl bg-[#F4EFE6]/60 border border-[#E8E1D5] max-w-2xl space-y-3">
            <div className="flex items-center gap-2 text-[#846F54]">
              <Shield className="w-4 h-4 stroke-[2]" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Catatan Keamanan & Hak Akses
              </span>
            </div>
            <p className="text-xs text-[#6B6862] leading-relaxed">
              Kata sandi ini melindungi dashboard studio Anda. Anda juga dapat mereset atau mengubah kata sandi akun kapan saja secara langsung melalui dashboard Supabase di menu <strong>Authentication &rarr; Users</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
