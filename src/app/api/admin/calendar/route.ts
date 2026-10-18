import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import { DEFAULT_BUSINESS_HOURS } from "@/lib/constants";
import {
  getStoredBlockedDates,
  createStoredBlockedDate,
  deleteStoredBlockedDate,
  getStoredBlockedSlots,
  createStoredBlockedSlot,
  deleteStoredBlockedSlot,
} from "@/lib/data/calendar-store";

export const dynamic = "force-dynamic";

async function getSupabaseClient() {
  const adminClient = createAdminSupabaseClient();
  if (adminClient) return adminClient;
  return await createServerSupabaseClient();
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // e.g. "2026-10"

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      businessHours: DEFAULT_BUSINESS_HOURS,
      blockedDates: getStoredBlockedDates(),
      blockedSlots: getStoredBlockedSlots(),
      bookings: [],
    });
  }

  try {
    const [bhRes, bdRes, bsRes, bRes] = await Promise.all([
      supabase.from("business_hours").select("*").order("day_of_week"),
      supabase.from("blocked_dates").select("*").order("blocked_date"),
      supabase.from("blocked_slots").select("*").order("slot_date"),
      supabase.from("bookings").select("id, booking_reference, customer_name, session_date, start_time, end_time, status, total_price"),
    ]);

    const blockedDates = bdRes.data && bdRes.data.length > 0 ? bdRes.data : getStoredBlockedDates();
    const blockedSlots = bsRes.data && bsRes.data.length > 0 ? bsRes.data : getStoredBlockedSlots();

    return NextResponse.json({
      businessHours: bhRes.data && bhRes.data.length > 0 ? bhRes.data : DEFAULT_BUSINESS_HOURS,
      blockedDates,
      blockedSlots,
      bookings: bRes.data || [],
    });
  } catch (err) {
    console.error("Error reading calendar data:", err);
    return NextResponse.json({
      businessHours: DEFAULT_BUSINESS_HOURS,
      blockedDates: getStoredBlockedDates(),
      blockedSlots: getStoredBlockedSlots(),
      bookings: [],
    });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, date, reason, start_time, end_time } = body;

    const supabase = await getSupabaseClient();

    if (action === "block_date") {
      let createdDate = createStoredBlockedDate({ blocked_date: date, reason });

      if (supabase) {
        const { data, error } = await supabase
          .from("blocked_dates")
          .insert({ blocked_date: date, reason: reason || "Libur Studio" })
          .select()
          .single();

        if (error) {
          console.error("Error blocking date in Supabase:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (data) createdDate = data;
      }

      try {
        revalidatePath("/admin/calendar");
        revalidatePath("/booking");
      } catch {}

      return NextResponse.json({ success: true, blockedDate: createdDate });
    }

    if (action === "block_slot") {
      let createdSlot = createStoredBlockedSlot({
        slot_date: date,
        start_time,
        end_time,
        reason,
      });

      if (supabase) {
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

        if (error) {
          console.error("Error blocking slot in Supabase:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        if (data) createdSlot = data;
      }

      try {
        revalidatePath("/admin/calendar");
        revalidatePath("/booking");
      } catch {}

      return NextResponse.json({ success: true, blockedSlot: createdSlot });
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

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    if (Array.isArray(businessHours)) {
      for (const item of businessHours) {
        const { error } = await supabase
          .from("business_hours")
          .upsert({
            day_of_week: item.day_of_week,
            is_open: item.is_open,
            open_time: item.open_time,
            close_time: item.close_time,
            slot_interval_minutes: item.slot_interval_minutes || 60,
          }, { onConflict: "day_of_week" });

        if (error) {
          console.error("Error updating business hours:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    try {
      revalidatePath("/admin/calendar");
      revalidatePath("/booking");
    } catch {}

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

    const supabase = await getSupabaseClient();

    if (type === "date") {
      deleteStoredBlockedDate(id);
      if (supabase) {
        const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
        if (error) {
          console.error("Error deleting blocked date:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    } else if (type === "slot") {
      deleteStoredBlockedSlot(id);
      if (supabase) {
        const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
        if (error) {
          console.error("Error deleting blocked slot:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    }

    try {
      revalidatePath("/admin/calendar");
      revalidatePath("/booking");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Calendar delete error:", err);
    return NextResponse.json({ error: "Gagal membuka blokir." }, { status: 500 });
  }
}
