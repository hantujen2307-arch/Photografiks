import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import { DEFAULT_BUSINESS_HOURS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // e.g. "2026-10"

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      businessHours: DEFAULT_BUSINESS_HOURS,
      blockedDates: [],
      blockedSlots: [],
      bookings: [],
    });
  }

  const [bhRes, bdRes, bsRes, bRes] = await Promise.all([
    supabase.from("business_hours").select("*").order("day_of_week"),
    supabase.from("blocked_dates").select("*").order("blocked_date"),
    supabase.from("blocked_slots").select("*").order("slot_date"),
    supabase.from("bookings").select("id, booking_reference, customer_name, session_date, start_time, end_time, status, total_price"),
  ]);

  return NextResponse.json({
    businessHours: bhRes.data && bhRes.data.length > 0 ? bhRes.data : DEFAULT_BUSINESS_HOURS,
    blockedDates: bdRes.data || [],
    blockedSlots: bsRes.data || [],
    bookings: bRes.data || [],
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, date, reason, start_time, end_time } = body;

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, body });
    }

    if (action === "block_date") {
      const { data, error } = await supabase
        .from("blocked_dates")
        .insert({ blocked_date: date, reason: reason || "Libur Studio" })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, blockedDate: data });
    }

    if (action === "block_slot") {
      const { data, error } = await supabase
        .from("blocked_slots")
        .insert({
          slot_date: date,
          start_time,
          end_time,
          reason: reason || "Maintenance Studio / Istirahat",
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, blockedSlot: data });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (err: unknown) {
    console.error("Calendar POST error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { businessHours } = body;

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    if (Array.isArray(businessHours)) {
      for (const item of businessHours) {
        await supabase
          .from("business_hours")
          .upsert({
            day_of_week: item.day_of_week,
            is_open: item.is_open,
            open_time: item.open_time,
            close_time: item.close_time,
            slot_interval_minutes: item.slot_interval_minutes || 60,
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Calendar update error:", err);
    return NextResponse.json({ error: "Gagal memperbarui jam operasional." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "date" or "slot"
    const id = searchParams.get("id");

    if (!id || !type) {
      return NextResponse.json({ error: "ID dan type diperlukan" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return NextResponse.json({ success: true });

    if (type === "date") {
      await supabase.from("blocked_dates").delete().eq("id", id);
    } else if (type === "slot") {
      await supabase.from("blocked_slots").delete().eq("id", id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Calendar delete error:", err);
    return NextResponse.json({ error: "Gagal membuka blokir." }, { status: 500 });
  }
}
