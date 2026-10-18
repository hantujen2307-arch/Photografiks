import { PackageItem, PortfolioItem, TestimonialItem, FaqItem, SiteSettings, BusinessHours } from "@/types";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  hero_headline: "Every Moment Deserves to Be Remembered.",
  hero_subheadline: "Studio fotografi editorial & portrait di Jakarta. Menghadirkan karya visual yang intim, abadi, dan bercerita tentang jati diri Anda.",
  studio_name: "MOMEN.POTRAIT",
  studio_tagline: "Editorial & Timeless Portrait Studio",
  studio_address: "Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan 12190",
  whatsapp_number: "6285157335443",
  instagram_username: "@momen.potrait",
  tiktok_username: "@momenpotrait.studio",
  email_contact: "hello@momenpotrait.com",
  operating_hours_text: "Senin – Minggu: 09:00 – 19:00 WIB",
  about_story: "MOMEN.POTRAIT didirikan atas keyakinan bahwa sebuah potret bukan sekadar gambar, melainkan kapsul waktu yang mengabadikan emosi murni, keaslian, dan keanggunan setiap individu. Dengan pencahayaan alami yang dipadukan teknik studio editorial kelas dunia, kami menciptakan karya visual yang tak lekang oleh waktu.",
  about_philosophy: "Kami memperlakukan setiap sesi foto sebagai ruang eksplorasi yang nyaman dan personal. Tanpa pose kaku, kami memandu Anda menemukan rasa percaya diri terbaik di depan lensa.",
};

export const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: "pkg-1",
    slug: "solo-editorial",
    name: "The Solo Editorial",
    tagline: "Potret personal dengan estetika majalah fashion berkarakter kuat.",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    price: 850000,
    duration_minutes: 60,
    photo_count_text: "15 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "1 Orang / Sesi Personal",
      "60 Menit Sesi Foto Studio Eksklusif",
      "2 Pilihan Konsep & Backdrop Studio",
      "15 Foto Retouch Resolusi Tinggi (Editorial Grade)",
      "Akses Link Google Drive Seluruh File Mentah (RAW/JPEG)",
      "Pengarahan Pose Profesional oleh Fotografer",
      "1 Cetak Fine Art 20x30 cm + Frame Minimalis"
    ],
    is_active: true,
    sort_order: 1
  },
  {
    id: "pkg-2",
    slug: "couple-intimate",
    name: "Intimate Couple Story",
    tagline: "Merayakan cinta, kehangatan, dan kedekatan dua hati dalam potret abadi.",
    image_url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=80",
    price: 1350000,
    duration_minutes: 90,
    photo_count_text: "25 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "2 Orang (Pre-wedding / Anniversary / Couple Session)",
      "90 Menit Sesi Foto Studio / Semi-Outdoor",
      "3 Kali Ganti Kostum / Pakaian",
      "25 Foto Retouch Resolusi Tinggi",
      "Akses Link Google Drive Seluruh File Mentah",
      "Panduan Moodboard & Konsep Visual Personal",
      "2 Cetak Fine Art 20x30 cm + 1 Cetak Kanvas 30x45 cm"
    ],
    is_active: true,
    sort_order: 2
  },
  {
    id: "pkg-3",
    slug: "graduation-heritage",
    name: "Graduation & Heritage",
    tagline: "Pencapaian berharga yang dirayakan bersama keluarga dan orang terkasih.",
    image_url: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=800&q=80",
    price: 1650000,
    duration_minutes: 90,
    photo_count_text: "30 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "Maksimal 5 Orang (Wisudawan + Keluarga Inti)",
      "90 Menit Sesi Foto Studio Lengkap",
      "Foto Tunggal Wisuda + Foto Formasi Keluarga",
      "30 Foto Retouch Resolusi Tinggi",
      "Akses Link Seluruh File Asli Tanpa Batas",
      "Properti Jubah, Topi & Ijazah Tersedia",
      "1 Cetak Kanvas Keluarga 40x60 cm Elegan"
    ],
    is_active: true,
    sort_order: 3
  },
  {
    id: "pkg-4",
    slug: "family-generations",
    name: "Family Generations",
    tagline: "Warisan kenangan keluarga lintas generasi yang penuh tawa dan kehangatan.",
    image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80",
    price: 2250000,
    duration_minutes: 120,
    photo_count_text: "40 Foto Pilihan (High-End Retouch) + Semua File Asli",
    features: [
      "Hingga 10 Anggota Keluarga",
      "120 Menit Sesi Studio Nyaman & Ramah Anak/Lansia",
      "Formasi Lengkap, Kakek-Nenek, Anak & Cucu",
      "40 Foto Retouch Resolusi Tinggi",
      "Akses Link Seluruh File Mentah",
      "Lounge Privat & Refreshment Ringan Selama Sesi",
      "1 Album Premium Hardcover 20x30 cm (20 Halaman)"
    ],
    is_active: true,
    sort_order: 4
  }
];

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: "port-1",
    title: "Aura of Serenity",
    category: "Portrait",
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    description: "Sesi potret editorial dengan permainan pencahayaan lembut bernuansa hangat.",
    is_featured: true,
    sort_order: 1
  },
  {
    id: "port-2",
    title: "Timeless Devotion",
    category: "Couple",
    image_url: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=1200&q=80",
    description: "Kisah cinta monokromatik yang menonjolkan kedekatan emosi tulus dua insan.",
    is_featured: true,
    sort_order: 2
  },
  {
    id: "port-3",
    title: "Summit of Triumph",
    category: "Graduation",
    image_url: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
    description: "Perayaan kelulusan berkelas dengan sentuhan editorial modern dan kebanggaan keluarga.",
    is_featured: true,
    sort_order: 3
  },
  {
    id: "port-4",
    title: "Golden Kinship",
    category: "Family",
    image_url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    description: "Potret keluarga tiga generasi dalam suasana studio yang hangat dan cair.",
    is_featured: true,
    sort_order: 4
  },
  {
    id: "port-5",
    title: "Monochrome Gaze",
    category: "Portrait",
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    description: "Potret ekspresi maskulin dengan kontras tegas dan detail tajam.",
    is_featured: true,
    sort_order: 5
  },
  {
    id: "port-6",
    title: "Quiet Symphony",
    category: "Editorial",
    image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80",
    description: "Eksplorasi siluet dan tekstur busana kontemporer dalam studio berlatar netral.",
    is_featured: true,
    sort_order: 6
  },
  {
    id: "port-7",
    title: "Eternal Promise",
    category: "Couple",
    image_url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    description: "Sesi pre-wedding minimalis bergaya sinematik Eropa.",
    is_featured: false,
    sort_order: 7
  },
  {
    id: "port-8",
    title: "Joyous Milestone",
    category: "Graduation",
    image_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    description: "Momen kelulusan bersama sahabat dengan tawa lepas dan energi positif.",
    is_featured: false,
    sort_order: 8
  },
  {
    id: "port-9",
    title: "Gala Evening Intimacy",
    category: "Event",
    image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    description: "Dokumentasi perayaan privat bernuansa hangat dengan pencahayaan lilin dramatis.",
    is_featured: false,
    sort_order: 9
  }
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "test-1",
    client_name: "Clarissa & Raditya",
    client_role: "Pre-wedding Couple",
    session_type: "Intimate Couple Story",
    content: "MOMEN.POTRAIT benar-benar mengubah pandangan kami tentang foto studio. Suasananya sangat santai, tidak ada rasa kaku sama sekali. Hasil fotonya seperti editorial majalah luar negeri yang elegan dan timeless!",
    rating: 5,
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    is_active: true,
    sort_order: 1
  },
  {
    id: "test-2",
    client_name: "dr. Amanda Prasetya",
    client_role: "Wisudawan Spesialis UI",
    session_type: "Graduation & Heritage",
    content: "Sangat puas dengan arahan gaya dari tim fotografer. Orang tua saya yang biasanya susah senyum di depan kamera pun merasa nyaman dan hasilnya luar biasa menyentuh.",
    rating: 5,
    image_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    is_active: true,
    sort_order: 2
  },
  {
    id: "test-3",
    client_name: "Kevin Sanjaya",
    client_role: "Creative Director",
    session_type: "The Solo Editorial",
    content: "Pencahayaan studio dan color grading-nya berkelas internasional. Detail kulit tetap natural tanpa over-editing. Sangat direkomendasikan untuk siapa pun yang butuh personal branding berkarakter.",
    rating: 5,
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    is_active: true,
    sort_order: 3
  }
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Bagaimana cara melakukan reservasi jadwal foto di MOMEN.POTRAIT?",
    answer: "Anda cukup memilih paket yang diinginkan melalui halaman Booking, tentukan tanggal pada kalender, pilih slot jam yang tersedia, dan lengkapi data kontak. Sistem kami akan langsung mengamankan slot tersebut dan memberikan nomor referensi booking.",
    category: "Booking",
    is_active: true,
    sort_order: 1
  },
  {
    id: "faq-2",
    question: "Apakah saya bisa menjadwalkan ulang (reschedule) sesi jika ada keperluan mendesak?",
    answer: "Bisa. Reschedule dapat dilakukan maksimal 3 hari (72 jam) sebelum waktu sesi Anda tanpa dikenakan biaya tambahan, disesuaikan dengan ketersediaan slot kosong berikutnya.",
    category: "Booking",
    is_active: true,
    sort_order: 2
  },
  {
    id: "faq-3",
    question: "Berapa lama proses pengerjaan dan pengiriman hasil foto?",
    answer: "Seluruh file asli (RAW/JPEG preview) akan dikirimkan maksimal 24 jam setelah sesi selesai melalui Google Drive pribadi. Foto pilihan yang membutuhkan retouch editorial selesai dalam 5-7 hari kerja.",
    category: "Delivery",
    is_active: true,
    sort_order: 3
  },
  {
    id: "faq-4",
    question: "Apakah MOMEN.POTRAIT menyediakan Make-Up Artist (MUA) dan busana?",
    answer: "Kami memiliki rekanan MUA profesional yang dapat diikutsertakan sebagai add-on sesi. Untuk busana, kami menyarankan klien membawa pakaian pribadi yang sesuai dengan panduan moodboard warna netral yang kami bagikan sebelum hari-H.",
    category: "Preparation",
    is_active: true,
    sort_order: 4
  },
  {
    id: "faq-5",
    question: "Apakah sesi foto bisa dilakukan di luar studio (outdoor / on-location)?",
    answer: "Ya, kami melayani pemotretan outdoor dan on-location di wilayah Jabodetabek. Silakan pilih opsi lokasi saat mengisi formulir booking atau konsultasikan terlebih dahulu dengan admin studio kami.",
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
