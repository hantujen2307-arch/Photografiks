import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndonesian(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatTimeShort(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr;
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export function generateBookingReference(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MP-${year}${month}-${randomChars}`;
}

export function cleanWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export function createWhatsAppUrl(phone: string, text: string): string {
  const cleaned = cleanWhatsAppNumber(phone);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

export function formatDateTimeIndonesian(date: Date = new Date()): string {
  try {
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${dateFormatted}, ${hours}:${minutes} WIB`;
  } catch {
    return date.toLocaleString("id-ID");
  }
}

export interface WhatsAppBookingParams {
  bookingReference: string;
  orderDateTime: string;
  customerName: string;
  customerWhatsapp: string;
  packageName: string;
  packageDuration: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  sessionLocation: string;
  price: number;
  notes?: string;
}

export function generateWhatsAppBookingMessage(params: WhatsAppBookingParams): string {
  const notesText = params.notes?.trim() ? `"${params.notes.trim()}"` : "-";
  const formattedSessionDate = formatDateIndonesian(params.sessionDate);
  const formattedStartTime = formatTimeShort(params.startTime);
  const formattedEndTime = formatTimeShort(params.endTime);
  const formattedPrice = formatIDR(params.price);

  return [
    "Halo MOMEN.POTRAIT & Moment Grads Palembang, saya ingin melakukan pemesanan sesi foto:",
    "",
    "📋 *DETAIL RESERVASI MOMEN.POTRAIT • MOMENT GRADS*",
    "━━━━━━━━━━━━━━━━━━━━",
    `• *No. Referensi:* ${params.bookingReference}`,
    `• *Tanggal Order:* ${params.orderDateTime}`,
    `• *Nama Pelanggan:* ${params.customerName}`,
    `• *No. WhatsApp:* ${params.customerWhatsapp || "-"}`,
    "",
    "📸 *PAKET & JADWAL SESI*",
    `• *Paket:* ${params.packageName} (${params.packageDuration} Menit)`,
    `• *Tanggal Sesi:* ${formattedSessionDate}`,
    `• *Jam Sesi:* ${formattedStartTime} - ${formattedEndTime} WIB`,
    `• *Lokasi:* ${params.sessionLocation}`,
    `• *Total Investasi:* ${formattedPrice}`,
    "",
    "📝 *Catatan / Konsep:*",
    notesText,
    "━━━━━━━━━━━━━━━━━━━━",
    "Mohon info nomor rekening untuk DP dan konfirmasi jadwalnya. Terima kasih!",
  ].join("\n");
}

