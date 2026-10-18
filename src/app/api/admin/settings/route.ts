import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient, uploadToSupabaseStorage } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import { DEFAULT_SITE_SETTINGS, DEFAULT_TESTIMONIALS, DEFAULT_FAQS } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function getSupabaseClient() {
  const adminClient = createAdminSupabaseClient();
  if (adminClient) return adminClient;
  return await createServerSupabaseClient();
}

function parseSettingValue(val: unknown): unknown {
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return val;
      }
    }
  }
  return val;
}

export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await getSupabaseClient();
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
    settingsRes.data.forEach((row: { key: string; value: unknown }) => {
      if (row.key in mergedSettings) {
        (mergedSettings as Record<string, unknown>)[row.key] = parseSettingValue(row.value);
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
    const contentType = request.headers.get("content-type") || "";
    let section = "general";
    let settings: Record<string, unknown> = {};
    let testimonials: unknown[] = [];
    let faqs: unknown[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      section = (formData.get("section") as string) || "general";

      const settingsRaw = formData.get("settings");
      if (typeof settingsRaw === "string") {
        try {
          settings = JSON.parse(settingsRaw);
        } catch {
          settings = {};
        }
      }

      // Handle Hero Main Image File upload
      const heroImageFile = formData.get("hero_image_file") as File | null;
      if (heroImageFile && heroImageFile.size > 0) {
        if (!heroImageFile.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "Foto utama hero harus berformat gambar (JPG, PNG, WebP)." },
            { status: 400 }
          );
        }
        if (heroImageFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Ukuran file foto utama hero maksimal 10MB." },
            { status: 400 }
          );
        }

        const ext = heroImageFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const filePath = `hero/main-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const buffer = Buffer.from(await heroImageFile.arrayBuffer());

        const uploadRes = await uploadToSupabaseStorage(
          "portfolio",
          filePath,
          buffer,
          heroImageFile.type || "image/jpeg"
        );

        if (uploadRes.error) {
          return NextResponse.json(
            { error: `Gagal mengunggah foto utama ke Supabase Storage: ${uploadRes.error}` },
            { status: 500 }
          );
        }

        if (uploadRes.url) {
          settings.hero_image_url = uploadRes.url;
        }
      }

      // Handle Hero Secondary (Couple/Floating) Image File upload
      const heroSecondaryFile = formData.get("hero_secondary_image_file") as File | null;
      if (heroSecondaryFile && heroSecondaryFile.size > 0) {
        if (!heroSecondaryFile.type.startsWith("image/")) {
          return NextResponse.json(
            { error: "Foto kartu melayang harus berformat gambar (JPG, PNG, WebP)." },
            { status: 400 }
          );
        }
        if (heroSecondaryFile.size > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Ukuran file foto kartu melayang maksimal 10MB." },
            { status: 400 }
          );
        }

        const ext = heroSecondaryFile.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const filePath = `hero/secondary-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
        const buffer = Buffer.from(await heroSecondaryFile.arrayBuffer());

        const uploadRes = await uploadToSupabaseStorage(
          "portfolio",
          filePath,
          buffer,
          heroSecondaryFile.type || "image/jpeg"
        );

        if (uploadRes.error) {
          return NextResponse.json(
            { error: `Gagal mengunggah foto kartu melayang ke Supabase Storage: ${uploadRes.error}` },
            { status: 500 }
          );
        }

        if (uploadRes.url) {
          settings.hero_secondary_image_url = uploadRes.url;
        }
      }
    } else {
      const body = await request.json();
      section = body.section || "general";
      settings = body.settings || {};
      testimonials = body.testimonials || [];
      faqs = body.faqs || [];
    }

    const supabase = await getSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, settings });
    }

    if ((section === "general" || section === "contact") && settings) {
      for (const [k, v] of Object.entries(settings)) {
        await supabase
          .from("site_settings")
          .upsert(
            {
              key: k,
              value: typeof v === "string" ? v : (JSON.stringify(v) as unknown as Record<string, unknown>),
            },
            { onConflict: "key" }
          );
      }

      // Immediately purge ISR cache so homepage reflects the new photos
      try {
        revalidatePath("/");
        revalidatePath("/admin");
        revalidatePath("/admin/settings");
      } catch (cacheErr) {
        console.warn("revalidatePath warning:", cacheErr);
      }
    }

    if (section === "testimonials" && Array.isArray(testimonials)) {
      for (const t of testimonials as Record<string, unknown>[]) {
        if (t.id && typeof t.id === "string" && !t.id.startsWith("new-")) {
          await supabase.from("testimonials").upsert(t);
        } else {
          const { id, ...rest } = t;
          await supabase.from("testimonials").insert(rest);
        }
      }
      try {
        revalidatePath("/");
      } catch {}
    }

    if (section === "faqs" && Array.isArray(faqs)) {
      for (const f of faqs as Record<string, unknown>[]) {
        if (f.id && typeof f.id === "string" && !f.id.startsWith("new-")) {
          await supabase.from("faqs").upsert(f);
        } else {
          const { id, ...rest } = f;
          await supabase.from("faqs").insert(rest);
        }
      }
      try {
        revalidatePath("/");
      } catch {}
    }

    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    console.error("Settings update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal menyimpan pengaturan." },
      { status: 500 }
    );
  }
}
