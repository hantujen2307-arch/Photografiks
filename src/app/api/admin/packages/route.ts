import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import {
  getStoredPackages,
  updateStoredPackage,
  createStoredPackage,
  deleteStoredPackage,
} from "@/lib/data/packages-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ packages: data });
      }
    }
  } catch (err) {
    console.warn("Supabase fetch failed in admin packages GET, fallback to local store:", err);
  }

  // Fallback to persistent local storage
  const stored = getStoredPackages();
  return NextResponse.json({ packages: stored });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      tagline,
      image_url,
      price,
      duration_minutes,
      photo_count_text,
      features,
      is_active,
      sort_order,
    } = body;

    if (!name || price === undefined || !duration_minutes) {
      return NextResponse.json(
        { error: "Nama, harga, dan durasi wajib diisi." },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newPackageData = {
      slug: slug + "-" + Date.now().toString(36),
      name,
      tagline: tagline || "",
      image_url: image_url || "",
      price: Number(price),
      duration_minutes: Number(duration_minutes),
      photo_count_text: photo_count_text || "Semua File Asli",
      features: Array.isArray(features) ? features : [],
      is_active: is_active ?? true,
      sort_order: Number(sort_order || 0),
    };

    // Save to persistent file storage
    const createdLocally = createStoredPackage(newPackageData);

    // If Supabase is connected, also insert into cloud database
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        await supabase.from("packages").insert({
          ...newPackageData,
          id: createdLocally.id,
        });
      }
    } catch (dbErr) {
      console.warn("Cloud DB sync skipped:", dbErr);
    }

    return NextResponse.json({ success: true, package: createdLocally });
  } catch (err: unknown) {
    console.error("Create package error:", err);
    return NextResponse.json(
      { error: "Gagal membuat paket baru." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      name,
      tagline,
      image_url,
      price,
      duration_minutes,
      photo_count_text,
      features,
      is_active,
      sort_order,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID paket diperlukan" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (price !== undefined) updateData.price = Number(price);
    if (duration_minutes !== undefined)
      updateData.duration_minutes = Number(duration_minutes);
    if (photo_count_text !== undefined)
      updateData.photo_count_text = photo_count_text;
    if (features !== undefined)
      updateData.features = Array.isArray(features) ? features : [];
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);

    // Update in persistent local file storage
    const updatedLocally = updateStoredPackage(id, updateData);

    // If Supabase is connected, also update in cloud database
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        await supabase
          .from("packages")
          .update(updateData)
          .eq("id", id);
      }
    } catch (dbErr) {
      console.warn("Cloud DB update skipped:", dbErr);
    }

    return NextResponse.json({
      success: true,
      package: updatedLocally || body,
    });
  } catch (err: unknown) {
    console.error("Update package error:", err);
    return NextResponse.json(
      { error: "Gagal memperbarui paket." },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: "ID paket diperlukan" },
        { status: 400 }
      );
    }

    deleteStoredPackage(id);

    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        await supabase.from("packages").delete().eq("id", id);
      }
    } catch (dbErr) {
      console.warn("Cloud DB delete skipped:", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete package error:", err);
    return NextResponse.json(
      { error: "Gagal menghapus paket." },
      { status: 500 }
    );
  }
}
