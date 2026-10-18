"use client";

import React, { useState, useEffect } from "react";
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

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "general", settings }),
      });
      if (!res.ok) throw new Error("Gagal menyimpan pengaturan.");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
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
          { key: "general", label: "Homepage & Headline" },
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
          <span>Perubahan konten berhasil disimpan ke database studio.</span>
        </div>
      )}

      {/* TAB 1: General & Headline */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl border border-[#E8E1D5] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-[#F4EFE6] pb-4">
            <h3 className="font-serif text-xl font-normal text-[#161514]">
              Headline &amp; Teks Hero Homepage
            </h3>
            <p className="text-xs text-[#6B6862] font-light mt-1">
              Pesan utama yang akan langsung dibaca oleh pengunjung saat membuka MOMEN.POTRAIT.
            </p>
          </div>

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

          <div className="pt-4 border-t border-[#F4EFE6] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#161514] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#2A2926] disabled:opacity-50 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
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
