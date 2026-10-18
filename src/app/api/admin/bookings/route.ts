import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import { timeToMinutes } from "@/lib/utils";

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
  const status = searchParams.get("status");
  const query = searchParams.get("q");
  const date = searchParams.get("date");

  const supabase = await getSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ bookings: [] });
  }

  let dbQuery = supabase
    .from("bookings")
    .select("*, package:packages(name, duration_minutes)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    dbQuery = dbQuery.eq("status", status);
  }
  if (date) {
    dbQuery = dbQuery.eq("session_date", date);
  }
  if (query) {
    dbQuery = dbQuery.or(
      `booking_reference.ilike.%${query}%,customer_name.ilike.%${query}%,customer_whatsapp.ilike.%${query}%`
    );
  }

  const { data, error } = await dbQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data || [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, admin_notes, session_date, start_time, end_time } = body;

    if (!id) {
      return NextResponse.json({ error: "ID booking diperlukan" }, { status: 400 });
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, updated: body });
    }

    // If admin is modifying schedule date/time, validate conflict
    if (session_date && start_time && end_time) {
      const newStart = timeToMinutes(start_time);
      const newEnd = timeToMinutes(end_time);

      const { data: conflicts } = await supabase
        .from("bookings")
        .select("id, start_time, end_time")
        .eq("session_date", session_date)
        .neq("id", id)
        .in("status", ["pending", "confirmed"]);

      const hasConflict = (conflicts || []).some((b) => {
        const bStart = timeToMinutes(b.start_time);
        const bEnd = timeToMinutes(b.end_time);
        return newStart < bEnd && newEnd > bStart;
      });

      if (hasConflict) {
        return NextResponse.json(
          { error: "Konflik jadwal: Slot waktu tersebut sudah terisi oleh booking lain." },
          { status: 409 }
        );
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (status) updatePayload.status = status;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;
    if (session_date) updatePayload.session_date = session_date;
    if (start_time) updatePayload.start_time = start_time;
    if (end_time) updatePayload.end_time = end_time;

    const { data: updated, error: updateErr } = await supabase
      .from("bookings")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (err: unknown) {
    console.error("Admin booking update error:", err);
    return NextResponse.json({ error: "Gagal memperbarui status booking." }, { status: 500 });
  }
}
