import { PackageItem, PortfolioItem, TestimonialItem, FaqItem, SiteSettings, BusinessHours } from "@/types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero_headline: "Every Moment Deserves to Be Remembered.",
  hero_subheadline: "Abadikan momen wisuda dan cerita berhargamu dalam potret yang estetik, natural, dan penuh kenangan.",
  hero_image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85",
  hero_secondary_image_url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=600&q=80",
  studio_name: "MOMEN.POTRAIT",
  studio_tagline: "Moment Grads Palembang — Graduation, Portrait & Story",
  studio_address: "Serving Palembang & Indralaya, South Sumatra",
  whatsapp_number: "6285157335443",
  instagram_username: "@moment.grads",
  tiktok_username: "@moment.grads",
  email_contact: "hello@momenpotrait.com",
  operating_hours_text: "Senin – Minggu: 08:00 – 18:00 WIB",
  about_story: "MOMEN.POTRAIT bersama Moment Grads Palembang menghadirkan layanan fotografi wisuda outdoor, personal portrait, couple, family, dan group photography di area Palembang dan Indralaya. Kami percaya setiap pencapaian dan kebersamaan berharga layak diabadikan dalam karya visual yang estetik, hangat, natural, dan tak lekang oleh waktu.",
  about_philosophy: "Kami menciptakan pengalaman pemotretan yang santai, bersahabat, dan terarah. Dengan arahan pose yang luwes dan natural, kami membantu Anda mengekspresikan momen terbaik dengan penuh percaya diri.",
};

export const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: "pkg-1",
    slug: "solo-editorial",
    name: "The Solo Editorial",
    tagline: "Potret personal dan wisuda solo dengan sentuhan estetik, natural, dan berkarakter kuat.",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    price: 850000,
    duration_minutes: 60,
    photo_count_text: "15 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "1 Orang (Personal / Wisuda Solo)",
      "60 Menit Sesi Foto Outdoor / On-Location",
      "2 Konsep Pakaian / Spot Pilihan",
      "15 Foto Retouch Resolusi Tinggi (Color Graded)",
      "Akses Link Google Drive Seluruh File Asli (RAW/JPEG)",
      "Pengarahan Pose Santai & Terarah oleh Fotografer",
      "Area Palembang atau Indralaya (Kampus/Taman)"
    ],
    is_active: true,
    sort_order: 1
  },
  {
    id: "pkg-2",
    slug: "couple-intimate",
    name: "Intimate Couple Story",
    tagline: "Abadikan momen wisuda berdua, pre-wedding santai, atau cerita cinta dengan nuansa hangat dan romantis.",
    image_url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80",
    price: 1350000,
    duration_minutes: 90,
    photo_count_text: "25 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "2 Orang (Wisuda Berdua / Couple / Bestie)",
      "90 Menit Sesi Foto Outdoor / On-Location",
      "3 Kali Ganti Pakaian / Variasi Spot",
      "25 Foto Retouch Resolusi Tinggi (Color Graded)",
      "Akses Link Google Drive Seluruh File Asli",
      "Panduan Moodboard & Pengarahan Pose Alami",
      "Pilihan Spot Favorit Palembang / Indralaya"
    ],
    is_active: true,
    sort_order: 2
  },
  {
    id: "pkg-3",
    slug: "graduation-heritage",
    name: "Graduation & Heritage",
    tagline: "Pencapaian berharga hari kelulusan yang dirayakan bersama keluarga dan orang terkasih.",
    image_url: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=800&q=80",
    price: 1650000,
    duration_minutes: 90,
    photo_count_text: "30 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "Maksimal 5 Orang (Wisudawan + Keluarga Inti)",
      "90 Menit Sesi Foto Wisuda Outdoor / On-Location Kampus",
      "Kombinasi Foto Solo Wisuda & Formasi Keluarga",
      "30 Foto Retouch Resolusi Tinggi",
      "Akses Link Seluruh File Asli Tanpa Batas",
      "Bebas Properti Wisuda (Toga, Buket Bunga, Selempang)",
      "Area Palembang & Indralaya (UNSRI / Spot Pilihan)"
    ],
    is_active: true,
    sort_order: 3
  },
  {
    id: "pkg-4",
    slug: "family-generations",
    name: "Family Generations",
    tagline: "Dokumentasi wisuda kelompok, sahabat satu angkatan, atau keluarga besar yang meriah dan penuh kehangatan.",
    image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    price: 2250000,
    duration_minutes: 120,
    photo_count_text: "40 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "Hingga 10 Anggota Keluarga atau Grup Sahabat Wisuda",
      "120 Menit Sesi Foto Outdoor / On-Location Luas",
      "Formasi Lengkap, Sub-Grup Sahabat, & Momen Spontan",
      "40 Foto Retouch Resolusi Tinggi",
      "Akses Link Google Drive Seluruh File Asli",
      "Pengarahan Formasi Grup Profesional & Menyenangkan",
      "Cocok untuk Wisuda Bareng Sahabat atau Keluarga Besar"
    ],
    is_active: true,
    sort_order: 4
  }
];

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: "b0000000-0000-0000-0000-000000000001",
    title: "Aura of Serenity",
    category: "Portrait",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    description: "Sesi potret personal berkarakter dengan pencahayaan alami yang lembut dan estetik.",
    is_featured: true,
    sort_order: 1
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    title: "Timeless Devotion",
    category: "Couple",
    image_url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=1200&q=80",
    description: "Kisah cinta dan potret couple wisuda yang menonjolkan kedekatan emosi tulus dua insan.",
    is_featured: true,
    sort_order: 2
  },
  {
    id: "b0000000-0000-0000-0000-000000000003",
    title: "Summit of Triumph",
    category: "Graduation",
    image_url: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
    description: "Perayaan kelulusan berkelas di kampus dengan sentuhan estetik, natural, dan kebanggaan keluarga.",
    is_featured: true,
    sort_order: 3
  },
  {
    id: "b0000000-0000-0000-0000-000000000004",
    title: "Golden Kinship",
    category: "Family",
    image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    description: "Potret hangat keluarga di hari kelulusan wisuda dalam suasana cair dan penuh senyuman.",
    is_featured: true,
    sort_order: 4
  },
  {
    id: "b0000000-0000-0000-0000-000000000005",
    title: "Monochrome Gaze",
    category: "Portrait",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    description: "Potret personal wisudawan dengan ekspresi percaya diri dan detail visual yang tajam.",
    is_featured: true,
    sort_order: 5
  },
  {
    id: "b0000000-0000-0000-0000-000000000006",
    title: "Quiet Symphony",
    category: "Editorial",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    description: "Eksplorasi siluet dan komposisi modern bernuansa hangat khas Moment Grads Palembang.",
    is_featured: true,
    sort_order: 6
  },
  {
    id: "b0000000-0000-0000-0000-000000000007",
    title: "Eternal Promise",
    category: "Couple",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    description: "Sesi potret wisuda berdua dengan konsep estetik dan romantis di ruang terbuka hijau.",
    is_featured: false,
    sort_order: 7
  },
  {
    id: "b0000000-0000-0000-0000-000000000008",
    title: "Joyous Milestone",
    category: "Graduation",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    description: "Momen kelulusan bersama sahabat satu angkatan dengan tawa lepas dan energi positif.",
    is_featured: false,
    sort_order: 8
  },
  {
    id: "b0000000-0000-0000-0000-000000000009",
    title: "Gala Evening Intimacy",
    category: "Event",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    description: "Dokumentasi kebersamaan perayaan wisuda dan syukuran keluarga yang hangat dan intim.",
    is_featured: false,
    sort_order: 9
  }
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "test-1",
    client_name: "Clarissa & Raditya",
    client_role: "Graduation Couple",
    session_type: "Intimate Couple Story",
    content: "MOMEN.POTRAIT dan Moment Grads benar-benar membuat sesi foto wisuda kami sangat berkesan. Suasananya santai, tidak kaku, dan fotografernya sangat mengayomi. Hasil fotonya estetik, hangat, dan timeless!",
    rating: 5,
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    is_active: true,
    sort_order: 1
  },
  {
    id: "test-2",
    client_name: "dr. Amanda Prasetya",
    client_role: "Wisudawan UNSRI",
    session_type: "Graduation & Heritage",
    content: "Sangat puas dengan arahan gaya dari tim fotografer Moment Grads. Orang tua saya yang biasanya susah senyum di depan kamera pun merasa nyaman dan hasilnya luar biasa menyentuh.",
    rating: 5,
    image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    is_active: true,
    sort_order: 2
  },
  {
    id: "test-3",
    client_name: "Kevin Sanjaya",
    client_role: "Creative Graduate",
    session_type: "The Solo Editorial",
    content: "Tone warna dan color grading-nya estetik banget. Detail kulit tetap natural tanpa over-editing. Sangat direkomendasikan untuk siapa pun yang ingin potret wisuda dan personal portrait berkarakter di Palembang.",
    rating: 5,
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    is_active: true,
    sort_order: 3
  }
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Bagaimana cara melakukan booking sesi foto di MOMEN.POTRAIT?",
    answer: "Pilih paket yang Anda inginkan melalui menu Paket Foto atau Booking, tentukan tanggal pada kalender, pilih slot jam yang tersedia, dan lengkapi data kontak. Sistem kami akan mencatat reservasi Anda dan menghubungkan Anda langsung dengan admin WhatsApp untuk konfirmasi jadwal.",
    category: "Booking",
    is_active: true,
    sort_order: 1
  },
  {
    id: "faq-2",
    question: "Apakah saya bisa menjadwalkan ulang (reschedule) jika jadwal wisuda kampus berubah atau kendala cuaca?",
    answer: "Bisa. Khusus sesi outdoor atau penyesuaian jadwal seremonial wisuda kampus, reschedule dapat dikoordinasikan maksimal 3 hari (72 jam) sebelum sesi, atau disesuaikan secara fleksibel jika terjadi kendala cuaca ekstrem demi hasil foto terbaik.",
    category: "Booking",
    is_active: true,
    sort_order: 2
  },
  {
    id: "faq-3",
    question: "Berapa lama proses pengerjaan dan pengiriman file hasil foto?",
    answer: "Seluruh file foto asli (preview) akan dikirimkan maksimal 24–48 jam setelah sesi selesai melalui Google Drive pribadi. Foto pilihan yang membutuhkan proses color grading dan retouch estetik selesai dalam 5–7 hari kerja.",
    category: "Delivery",
    is_active: true,
    sort_order: 3
  },
  {
    id: "faq-4",
    question: "Bagaimana jika saya atau keluarga kaku dan belum berpengalaman berpose di depan kamera?",
    answer: "Tidak perlu khawatir! Fotografer kami berpengalaman mengarahkan pose secara santai, hangat, dan komunikatif agar setiap ekspresi terlihat natural, tidak kaku, dan penuh percaya diri.",
    category: "Preparation",
    is_active: true,
    sort_order: 4
  },
  {
    id: "faq-5",
    question: "Di mana saja cakupan area pemotretan Moment Grads Palembang?",
    answer: "Layanan utama kami mencakup area Palembang dan Indralaya, Sumatera Selatan — termasuk spot kampus UNSRI (Indralaya & Palembang), taman kota, landmark estetik, maupun on-location di venue acara wisuda.",
    category: "Location",
    is_active: true,
    sort_order: 5
  }
];

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { id: "bh-0", day_of_week: 0, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 },
  { id: "bh-1", day_of_week: 1, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 },
  { id: "bh-2", day_of_week: 2, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 },
  { id: "bh-3", day_of_week: 3, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 },
  { id: "bh-4", day_of_week: 4, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 },
  { id: "bh-5", day_of_week: 5, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 },
  { id: "bh-6", day_of_week: 6, is_open: true, open_time: "09:00:00", close_time: "19:00:00", slot_interval_minutes: 60 }
];
