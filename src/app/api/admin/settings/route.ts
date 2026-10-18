import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import { DEFAULT_SITE_SETTINGS, DEFAULT_TESTIMONIALS, DEFAULT_FAQS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({
      settings: DEFAULT_SITE_SETTINGS,
      testimonials: DEFAULT_TESTIMONIALS,
      faqs: DEFAULT_FAQS,
    });
  }

  const [settingsRes, testRes, faqRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("testimonials").select("*").order("sort_order"),
    supabase.from("faqs").select("*").order("sort_order"),
  ]);

  const mergedSettings = { ...DEFAULT_SITE_SETTINGS };
  if (settingsRes.data) {
    settingsRes.data.forEach((row) => {
      if (row.key in mergedSettings) {
        (mergedSettings as Record<string, unknown>)[row.key] = row.value;
      }
    });
  }

  return NextResponse.json({
    settings: mergedSettings,
    testimonials: testRes.data || DEFAULT_TESTIMONIALS,
    faqs: faqRes.data || DEFAULT_FAQS,
  });
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { section, settings, testimonials, faqs } = body;

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    if (section === "general" && settings) {
      for (const [k, v] of Object.entries(settings)) {
        await supabase
          .from("site_settings")
          .upsert({ key: k, value: JSON.stringify(v) as unknown as Record<string, unknown> });
      }
    }

    if (section === "testimonials" && Array.isArray(testimonials)) {
      for (const t of testimonials) {
        if (t.id && !t.id.startsWith("new-")) {
          await supabase.from("testimonials").upsert(t);
        } else {
          const { id, ...rest } = t;
          await supabase.from("testimonials").insert(rest);
        }
      }
    }

    if (section === "faqs" && Array.isArray(faqs)) {
      for (const f of faqs) {
        if (f.id && !f.id.startsWith("new-")) {
          await supabase.from("faqs").upsert(f);
        } else {
          const { id, ...rest } = f;
          await supabase.from("faqs").insert(rest);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Settings update error:", err);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}
