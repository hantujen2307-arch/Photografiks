# MOMEN.POTRAIT — Studio & Portrait Photography Platform

A production-grade, editorial-luxury photography booking website and studio management system built with **Next.js App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, & Storage)**. Ready for deployment on **Vercel**.

---

## 📸 Overview & Brand Aesthetics

**MOMEN.POTRAIT** adalah platform pemesanan jasa fotografi profesional bernuansa editorial, minimalis, dan elegan:
- **Palette**: Ivory (`#FCFAF6`), Warm Beige (`#F4EFE6`), Sand Accent (`#C9BBA7`, `#B8976C`), dan Soft Charcoal (`#161514`).
- **Typography**: Headline editorial menggunakan *Playfair Display*, dipadukan dengan *Plus Jakarta Sans* untuk keterbacaan modern.
- **Mobile-First**: Tata letak responsif penuh, micro-interactions halus, kalender booking interaktif live, dan drawer menu yang nyaman di smartphone.
- **Data Integrity**: Bebas dari mock atau localStorage sementara; terhubung langsung dengan skema database PostgreSQL Supabase serta proteksi transaksi anti-double booking.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Supabase Auth, Supabase Storage)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Key Features

### 1. Public Website
- **Homepage (`/`)**:
  - Translucent sticky navigation with brand identity & status check.
  - Editorial hero section with curated high-resolution studio photography.
  - Featured portfolio gallery with category filtering and interactive lightbox modal.
  - Photography packages showcase with transparent IDR pricing, duration, and inclusions.
  - 4-step effortless booking process walkthrough.
  - Client testimonial carousel & interactive FAQ accordion.
  - Editorial footer with studio location, operating hours, and social media links.
- **Portfolio Gallery (`/portfolio`)**:
  - Filter by Portrait, Couple, Graduation, Family, Event, and Editorial.
  - Full-screen lightbox preview with session metadata and direct booking link.
- **Packages & Investment (`/packages`)**:
  - In-depth package specifications (photo count, edited fine art, Google Drive RAW delivery).
  - Add-on services guide (ekstra waktu, cetak kanvas museum grade, layanan kilat 24 jam).
- **Booking Wizard (`/booking`)**:
  - 5-step interactive workflow:
    1. Pilih paket foto.
    2. Kalender interaktif dengan disabled past dates dan tutup tanggal studio.
    3. Slot jam live yang memperhitungkan durasi paket dan konflik jadwal.
    4. Pengisian data diri, nomor WhatsApp terverifikasi, dan preferensi lokasi.
    5. Ringkasan biaya otomatis dan struk referensi pemesanan resmi (`MP-YYYYMM-XXXX`).
- **Booking Status Tracker (`/booking/status`)**:
  - Pelacakan langsung status pemesanan (`pending`, `confirmed`, `completed`, `cancelled`) menggunakan nomor referensi.
- **About & Contact (`/about`, `/contact`)**:
  - Profil studio, filosofi fotografer, formulir pesan, dan integrasi tombol WhatsApp studio.

### 2. Admin Dashboard (`/admin`)
- **Autentikasi Aman**: Login khusus admin via Supabase Auth dengan verifikasi tabel `admin_profiles` (tanpa registrasi publik).
- **Overview Dashboard (`/admin`)**: Metrik total booking, pending approvals, confirmed sessions, estimasi pendapatan, dan agenda sesi hari ini.
- **Manajemen Booking (`/admin/bookings`)**: Pencarian multi-kriteria, filter tanggal dan status, konfirmasi sesi, tandai selesai, pembatalan, dan catatan internal admin.
- **Manajemen Paket (`/admin/packages`)**: Tambah, edit, nonaktifkan, dan atur urutan paket secara langsung tanpa menyentuh kode.
- **Manajemen Portofolio (`/admin/portfolio`)**: Upload foto ke Supabase Storage (bucket `portfolio`), kelola metadata, dan hapus foto dengan pembersihan file otomatis.
- **Manajemen Kalender & Jam Operasional (`/admin/calendar`)**: Tinjau kalender bulanan, tutup tanggal tertentu (libur studio), blokir rentang jam khusus (istirahat/maintenance), dan atur jam kerja mingguan.
- **Pengaturan Konten Website (`/admin/settings`)**: Edit headline homepage, deskripsi hero, alamat studio, nomor WhatsApp, testimoni klien, dan daftar FAQ dari database.

---

## 🗄️ Database Schema & SQL Migration

Migration SQL siap pakai tersedia di [`supabase/migrations/20261018000000_init_momen_potrait.sql`](./supabase/migrations/20261018000000_init_momen_potrait.sql).

### Tabel Utama:
1. `admin_profiles`: Otorisasi peran admin studio (`superadmin`, `admin`).
2. `packages`: Katalog paket fotografi, durasi, harga tepercaya, dan fasilitas.
3. `portfolio_items`: Karya foto studio dan path Supabase Storage.
4. `bookings`: Data reservasi klien dengan nomor referensi unik, tanggal, jam, lokasi, total harga, dan status.
5. `business_hours`: Jam buka/tutup harian (Senin - Minggu).
6. `blocked_dates`: Tanggal libur/tutup studio.
7. `blocked_slots`: Rentang waktu yang diblokir khusus oleh admin.
8. `site_settings`: Konfigurasi dinamis teks website (headline, kontak, alamat).
9. `testimonials`: Ulasan klien yang dapat diatur admin.
10. `faqs`: Daftar tanya jawab seputar studio.

### Mekanisme Anti-Double Booking Atomik
Sistem menggunakan PostgreSQL RPC Function `create_booking_atomic()`:
- Menerapkan `pg_advisory_xact_lock` berdasarkan tanggal sesi untuk mencegah *race condition*.
- Memvalidasi durasi paket langsung dari tabel `packages` (tidak mempercayai harga/durasi dari browser).
- Memeriksa konflik terhadap `blocked_dates`, `blocked_slots`, serta booking berstatus `pending` dan `confirmed` menggunakan operator `OVERLAPS`.
- Pesanan yang berstatus `cancelled` secara otomatis tidak lagi memblokir slot jam.

---

## ⚙️ Environment Variables

Salin `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Isi dengan kredensial dari project Supabase Anda:

```env
# URL Project Supabase (Project Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon Public Key (Aman digunakan di browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Supabase Service Role Key (SERVER ONLY — JANGAN expose ke browser)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Nomor WhatsApp Resmi Studio
NEXT_PUBLIC_STUDIO_WHATSAPP=6281234567890
```

---

## 📋 Langkah Menjalankan Secara Lokal

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Migration di Supabase**:
   - Buka Supabase Dashboard &rarr; **SQL Editor**.
   - Copy dan paste isi file [`supabase/migrations/20261018000000_init_momen_potrait.sql`](./supabase/migrations/20261018000000_init_momen_potrait.sql).
   - Klik **Run** untuk mengeksekusi skema, RLS, storage bucket `portfolio`, dan seed data awal.

3. **Buat Akun Administrator Pertama**:
   - Buka Supabase Dashboard &rarr; **Authentication** &rarr; **Users** &rarr; **Add User**.
   - Masukkan email (misal: `admin@momenpotrait.com`) dan password pilihan Anda.
   - Salin **User UID** dari user yang baru dibuat.
   - Di SQL Editor Supabase, jalankan:
     ```sql
     INSERT INTO public.admin_profiles (user_id, email, full_name, role)
     VALUES ('<MASUKKAN-USER-UID-DISINI>', 'admin@momenpotrait.com', 'Super Admin MOMEN.POTRAIT', 'superadmin');
     ```

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Akses `http://localhost:3000` untuk website publik atau `http://localhost:3000/admin` untuk portal studio.

5. **Build Production Verification**:
   ```bash
   npm run build
   ```

---

## 🌐 Panduan Deployment ke Vercel

1. **Push ke GitHub**:
   ```bash
   git remote add origin https://github.com/<username>/<repo-name>.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy di Vercel**:
   - Buka [Vercel Dashboard](https://vercel.com/dashboard) &rarr; **Add New Project**.
   - Impor repositori GitHub yang baru di-push.
   - Pada bagian **Environment Variables**, tambahkan:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_STUDIO_WHATSAPP`
   - Klik **Deploy**.

3. **Konfigurasi URL Website di Supabase**:
   - Buka Supabase Dashboard &rarr; **Authentication** &rarr; **URL Configuration**.
   - Tambahkan URL Vercel produksi Anda (misal: `https://momen-potrait.vercel.app`) ke dalam **Site URL** dan **Redirect URLs**.

4. **Custom Domain (Opsional)**:
   - Di dashboard Vercel, masuk ke **Settings** &rarr; **Domains** untuk menambahkan domain kustom (contoh: `momenpotrait.com`).
