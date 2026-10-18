import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cleanWhatsAppNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("ref");
    const whatsapp = searchParams.get("wa");

    if (!reference) {
      return NextResponse.json(
        { error: "Nomor referensi booking (ref) wajib disertakan." },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    if (supabase) {
      let query = supabase
        .from("bookings")
        .select(`
          id,
          booking_reference,
          customer_name,
          customer_whatsapp,
          session_date,
          start_time,
          end_time,
          session_location,
          total_price,
          status,
          created_at,
          package:packages(id, name, duration_minutes, photo_count_text)
        `)
        .eq("booking_reference", reference.trim().toUpperCase());

      // If customer provides WhatsApp number, verify matching
      if (whatsapp) {
        const cleaned = cleanWhatsAppNumber(whatsapp);
        query = query.eq("customer_whatsapp", cleaned);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Booking lookup query error:", error);
        return NextResponse.json(
          { error: "Terjadi kesalahan saat memeriksa data booking." },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Data booking dengan nomor referensi tersebut tidak ditemukan." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        booking: data,
      });
    }

    // Mock preview for test booking references
    if (reference.toUpperCase().startsWith("MP-")) {
      return NextResponse.json({
        success: true,
        booking: {
          id: "mock-preview-id",
          booking_reference: reference.toUpperCase(),
          customer_name: "Klien MOMEN.POTRAIT",
          session_date: new Date().toISOString().split("T")[0],
          start_time: "10:00:00",
          end_time: "11:30:00",
          session_location: "Studio MOMEN.POTRAIT (Senopati, Jakarta Selatan)",
          total_price: 1350000,
          status: "pending",
          package: {
            name: "Intimate Couple Story",
            duration_minutes: 90,
          },
          created_at: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Booking tidak ditemukan." },
      { status: 404 }
    );
  } catch (err) {
    console.error("Status lookup error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat mencari status booking." },
      { status: 500 }
    );
  }
}
