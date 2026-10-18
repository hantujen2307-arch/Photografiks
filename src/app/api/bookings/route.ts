import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_PACKAGES } from "@/lib/constants";
import { getStoredPackages } from "@/lib/data/packages-store";
import {
  generateBookingReference,
  timeToMinutes,
  minutesToTime,
  cleanWhatsAppNumber,
} from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      package_id,
      session_date,
      start_time,
      customer_name,
      customer_whatsapp,
      customer_email,
      session_location,
      notes,
    } = body;

    // 1. Rigorous input validation
    if (!package_id || !session_date || !start_time || !customer_name || !customer_whatsapp) {
      return NextResponse.json(
        {
          error: "Mohon lengkapi semua bidang wajib (paket, tanggal, jam, nama, dan WhatsApp).",
        },
        { status: 400 }
      );
    }

    // Validate Asia/Jakarta date not in the past
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    if (session_date < todayStr) {
      return NextResponse.json(
        { error: "Tanggal sesi tidak boleh di masa lampau." },
        { status: 400 }
      );
    }

    const cleanedWa = cleanWhatsAppNumber(customer_whatsapp);
    if (cleanedWa.length < 10) {
      return NextResponse.json(
        { error: "Nomor WhatsApp tidak valid. Format harus diawali 08... atau 62..." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // 2. Resolve package verified price & duration directly from Database
    let verifiedPrice = 850000;
    let verifiedDuration = 60;
    let packageName = "Sesi Foto MOMEN.POTRAIT";

    if (supabase) {
      const { data: pkg, error: pkgError } = await supabase
        .from("packages")
        .select("*")
        .eq("id", package_id)
        .eq("is_active", true)
        .single();

      if (pkgError || !pkg) {
        return NextResponse.json(
          { error: "Paket foto yang dipilih tidak valid atau sudah nonaktif." },
          { status: 400 }
        );
      }

      verifiedPrice = pkg.price;
      verifiedDuration = pkg.duration_minutes;
      packageName = pkg.name;
    } else {
      const stored = getStoredPackages();
      const fallback = stored.find((p) => p.id === package_id) || DEFAULT_PACKAGES.find((p) => p.id === package_id);
      if (fallback) {
        verifiedPrice = fallback.price;
        verifiedDuration = fallback.duration_minutes;
        packageName = fallback.name;
      }
    }

    // Compute end_time
    const startMinutes = timeToMinutes(start_time);
    const endMinutes = startMinutes + verifiedDuration;
    const endTimeStr = minutesToTime(endMinutes);

    // 3. Prevent Double Booking
    if (supabase) {
      // First try PostgreSQL atomic RPC function `create_booking_atomic` if installed
      const bookingRef = generateBookingReference();

      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "create_booking_atomic",
        {
          p_customer_name: customer_name.trim(),
          p_customer_whatsapp: cleanedWa,
          p_customer_email: customer_email ? customer_email.trim() : null,
          p_package_id: package_id,
          p_session_date: session_date,
          p_start_time: start_time,
          p_session_location: session_location || "Palembang & Indralaya (Outdoor / On-Location)",
          p_notes: notes || null,
        }
      );

      if (!rpcError && rpcData) {
        return NextResponse.json({
          success: true,
          booking: rpcData,
        });
      }

      // If RPC is not created yet or standard fallback table check:
      // Check blocked dates
      const { data: isBlockedDate } = await supabase
        .from("blocked_dates")
        .select("id")
        .eq("blocked_date", session_date)
        .maybeSingle();

      if (isBlockedDate) {
        return NextResponse.json(
          { error: "Tanggal ini ditutup oleh studio. Silakan pilih tanggal lain." },
          { status: 409 }
        );
      }

      // Check overlapping bookings
      const { data: conflictBookings } = await supabase
        .from("bookings")
        .select("id, start_time, end_time")
        .eq("session_date", session_date)
        .in("status", ["pending", "confirmed"]);

      const hasConflict = (conflictBookings || []).some((b) => {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        return startMinutes < bEnd && endMinutes > bStart;
      });

      if (hasConflict) {
        return NextResponse.json(
          {
            error:
              "Slot waktu tersebut baru saja dipesan oleh pelanggan lain. Silakan pilih jam lain.",
          },
          { status: 409 }
        );
      }

      // Insert new booking
      const newBooking = {
        booking_reference: bookingRef,
        customer_name: customer_name.trim(),
        customer_whatsapp: cleanedWa,
        customer_email: customer_email ? customer_email.trim() : null,
        package_id,
        session_date,
        start_time,
        end_time: endTimeStr,
        session_location: session_location || "Palembang & Indralaya (Outdoor / On-Location)",
        notes: notes || null,
        total_price: verifiedPrice,
        status: "pending",
      };

      const { data: createdBooking, error: insertError } = await supabase
        .from("bookings")
        .insert(newBooking)
        .select()
        .single();

      if (insertError) {
        console.error("Booking insert error:", insertError);
        return NextResponse.json(
          { error: "Gagal menyimpan data pesanan ke database: " + insertError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        booking: createdBooking,
      });
    }

    // In case Supabase is not yet connected (local preview mode):
    const mockRef = generateBookingReference();
    return NextResponse.json({
      success: true,
      booking: {
        id: "mock-" + Date.now(),
        booking_reference: mockRef,
        customer_name: customer_name.trim(),
        customer_whatsapp: cleanedWa,
        customer_email: customer_email || null,
        package_id,
        package_name: packageName,
        session_date,
        start_time,
        end_time: endTimeStr,
        session_location: session_location || "Palembang & Indralaya (Outdoor / On-Location)",
        notes: notes || null,
        total_price: verifiedPrice,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("Booking submission error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat memproses pemesanan." },
      { status: 500 }
    );
  }
}
