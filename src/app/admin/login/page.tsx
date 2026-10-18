"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Shield, Lock, Mail, ArrowRight, Loader2, AlertCircle, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@momenpotrait.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Email atau kata sandi tidak valid.");
      }

      // If Supabase client is also active, optionally sign in there too
      const supabase = createClient();
      if (supabase) {
        try {
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });
        } catch {
          // ignore if purely local session
        }
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal masuk ke dashboard admin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141413] text-[#FCFAF6] flex flex-col justify-between p-6 sm:p-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white text-[#141413] flex items-center justify-center">
            <Camera className="w-4 h-4 stroke-[2]" />
          </div>
          <span className="font-serif text-lg tracking-[0.2em] uppercase font-medium">
            MOMEN<span className="text-[#DFC9A8]">.</span>POTRAIT
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs uppercase tracking-wider text-[#A9A59E] hover:text-white transition-colors"
        >
          &larr; Kembali ke Website
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-12 bg-[#1C1B19] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#DFC9A8] mx-auto mb-4">
            <Shield className="w-6 h-6 stroke-[1.75]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#A9A59E] font-semibold block mb-1">
            Studio Security Portal
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white">
            Masuk Portal Admin
          </h2>
          <p className="text-xs text-[#846F54] font-light mt-2">
            Akses privat khusus staf dan fotografer MOMEN.POTRAIT
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#A9A59E] font-semibold mb-2">
              Email Administrator
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#846F54] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@momenpotrait.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/15 text-sm bg-white/5 text-white placeholder-white/30 focus:outline-hidden focus:border-[#DFC9A8]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#A9A59E] font-semibold mb-2">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#846F54] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/15 text-sm bg-white/5 text-white placeholder-white/30 focus:outline-hidden focus:border-[#DFC9A8]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#FCFAF6] text-[#141413] text-xs uppercase tracking-[0.16em] font-medium hover:bg-[#DFC9A8] transition-all disabled:opacity-50 shadow-lg mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#141413]" />
                <span>Memverifikasi Otorisasi...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Setup guide trigger */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="inline-flex items-center gap-1.5 text-xs text-[#DFC9A8] hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan Pembuatan Akun Admin Pertama</span>
          </button>

          {showSetupGuide && (
            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-left text-[11px] text-[#D5D0C7] font-light leading-relaxed animate-in fade-in duration-200">
              <strong className="block text-white mb-1 font-medium">
                Cara Mendaftarkan Admin Pertama di Supabase:
              </strong>
              <ol className="list-decimal list-inside space-y-1.5 text-[#A9A59E]">
                <li>Buka Supabase Dashboard &rarr; <strong>Authentication</strong> &rarr; <strong>Users</strong>.</li>
                <li>Klik <strong>Add User</strong> &rarr; <strong>Create User</strong> dengan email &amp; kata sandi pilihan Anda (Auto Confirm Email dicentang).</li>
                <li>Salin <strong>User UID</strong> yang baru saja dibuat.</li>
                <li>Buka <strong>SQL Editor</strong> di Supabase dan jalankan:</li>
              </ol>
              <pre className="mt-2 p-2.5 bg-black/50 rounded text-[10px] font-mono text-[#DFC9A8] overflow-x-auto">
{`INSERT INTO public.admin_profiles (user_id, email, full_name, role)
VALUES ('<PASTE-USER-UID-DISINI>', 'admin@momenpotrait.com', 'Super Admin', 'superadmin');`}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Bottom info */}
      <div className="text-center text-xs text-[#846F54] font-light">
        MOMEN.POTRAIT Enterprise Management System &bull; Jakarta, Indonesia
      </div>
    </div>
  );
}
