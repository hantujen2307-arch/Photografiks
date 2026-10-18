import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase/public";
import { DEFAULT_PACKAGES, DEFAULT_BUSINESS_HOURS } from "@/lib/constants";
import { getStoredPackages } from "@/lib/data/packages-store";
import { timeToMinutes, minutesToTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const packageId = searchParams.get("package_id");

    if (!date) {
      return NextResponse.json(
        { error: "Parameter tanggal (date) wajib diisi." },
        { status: 400 }
      );
    }

    // 1. Determine package duration
    let durationMinutes = 60;
    const storedPackages = getStoredPackages();
    const fallbackPkg = storedPackages.find((p) => p.id === packageId) || DEFAULT_PACKAGES.find((p) => p.id === packageId);
    if (fallbackPkg) {
      durationMinutes = fallbackPkg.duration_minutes;
    }

    const supabase = getPublicSupabase();

    let openTime = "09:00:00";
    let closeTime = "19:00:00";
    let isOpen = true;

    const targetDateObj = new Date(date + "T00:00:00+07:00");
    const dayOfWeek = targetDateObj.getDay();

    const fallbackHours = DEFAULT_BUSINESS_HOURS.find(
      (b) => b.day_of_week === dayOfWeek
    );
    if (fallbackHours) {
      isOpen = fallbackHours.is_open;
      openTime = fallbackHours.open_time;
      closeTime = fallbackHours.close_time;
    }

    const bookedRanges: { start: number; end: number }[] = [];
    let isDateBlocked = false;

    if (supabase) {
      const sb = supabase as any;
      // Fetch actual package duration from DB
      if (packageId) {
        const { data: pkgData } = await sb
          .from("packages")
          .select("duration_minutes")
          .eq("id", packageId)
          .single();
        if (pkgData) {
          durationMinutes = pkgData.duration_minutes;
        }
      }

      // Check business hours
      const { data: bhData } = await sb
        .from("business_hours")
        .select("*")
        .eq("day_of_week", dayOfWeek)
        .single();
      if (bhData) {
        isOpen = bhData.is_open;
        openTime = bhData.open_time;
        closeTime = bhData.close_time;
      }

      // Check blocked dates
      const { data: blockedDateData } = await sb
        .from("blocked_dates")
        .select("id")
        .eq("blocked_date", date)
        .maybeSingle();

      if (blockedDateData) {
        isDateBlocked = true;
      }

      // Fetch blocked slots
      const { data: blockedSlotData } = await sb
        .from("blocked_slots")
        .select("start_time, end_time")
        .eq("slot_date", date);

      if (blockedSlotData) {
        blockedSlotData.forEach((s: any) => {
          bookedRanges.push({
            start: timeToMinutes(s.start_time),
            end: timeToMinutes(s.end_time),
          });
        });
      }

      // Fetch active bookings (pending & confirmed)
      const { data: bookingsData } = await sb
        .from("bookings")
        .select("start_time, end_time")
        .eq("session_date", date)
        .in("status", ["pending", "confirmed"]);

      if (bookingsData) {
        bookingsData.forEach((b: any) => {
          bookedRanges.push({
            start: timeToMinutes(b.start_time),
            end: timeToMinutes(b.end_time),
          });
        });
      }
    }

    if (!isOpen || isDateBlocked) {
      return NextResponse.json({
        date,
        isOpen: false,
        isDateBlocked,
        slots: [],
      });
    }

    // Generate candidate slots between openTime and closeTime
    const openMinutes = timeToMinutes(openTime);
    const closeMinutes = timeToMinutes(closeTime);

    const slots = [];
    for (
      let startMin = openMinutes;
      startMin + durationMinutes <= closeMinutes;
      startMin += 60 // 1 hour step or interval
    ) {
      const endMin = startMin + durationMinutes;
      const startTimeStr = minutesToTime(startMin);
      const endTimeStr = minutesToTime(endMin);

      // Check for overlap with any bookedRanges: (startA < endB) and (endA > startB)
      const hasConflict = bookedRanges.some((range) => {
        return startMin < range.end && endMin > range.start;
      });

      slots.push({
        startTime: startTimeStr,
        endTime: endTimeStr,
        isAvailable: !hasConflict,
        reason: hasConflict ? "Sudah Dipesan" : undefined,
      });
    }

    return NextResponse.json({
      date,
      durationMinutes,
      slots,
    });
  } catch (err: unknown) {
    console.error("Availability API Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memeriksa ketersediaan." },
      { status: 500 }
    );
  }
}
