import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ packages: [] });
  }

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ packages: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, tagline, image_url, price, duration_minutes, photo_count_text, features, is_active, sort_order } = body;

    if (!name || price === undefined || !duration_minutes) {
      return NextResponse.json({ error: "Nama, harga, dan durasi wajib diisi." }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, package: { id: "mock-" + Date.now(), ...body, slug } });
    }

    const { data, error } = await supabase
      .from("packages")
      .insert({
        slug: slug + "-" + Date.now().toString(36),
        name,
        tagline: tagline || "",
        image_url: image_url || null,
        price: Number(price),
        duration_minutes: Number(duration_minutes),
        photo_count_text: photo_count_text || "Semua File Asli",
        features: Array.isArray(features) ? features : [],
        is_active: is_active ?? true,
        sort_order: Number(sort_order || 0),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, package: data });
  } catch (err: unknown) {
    console.error("Create package error:", err);
    return NextResponse.json({ error: "Gagal membuat paket baru." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, tagline, image_url, price, duration_minutes, photo_count_text, features, is_active, sort_order } = body;

    if (!id) {
      return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, package: body });
    }

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (price !== undefined) updateData.price = Number(price);
    if (duration_minutes !== undefined) updateData.duration_minutes = Number(duration_minutes);
    if (photo_count_text !== undefined) updateData.photo_count_text = photo_count_text;
    if (features !== undefined) updateData.features = features;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);

    const { data, error } = await supabase
      .from("packages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, package: data });
  } catch (err: unknown) {
    console.error("Update package error:", err);
    return NextResponse.json({ error: "Gagal memperbarui paket." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID paket diperlukan" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete package error:", err);
    return NextResponse.json({ error: "Gagal menghapus paket." }, { status: 500 });
  }
}
