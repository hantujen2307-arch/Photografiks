import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import {
  getStoredPackages,
  updateStoredPackage,
  createStoredPackage,
  deleteStoredPackage,
} from "@/lib/data/packages-store";

export const dynamic = "force-dynamic";

async function getSupabaseClient() {
  const adminClient = createAdminSupabaseClient();
  if (adminClient) return adminClient;
  return await createServerSupabaseClient();
}

/**
 * If imageUrl is a base64 Data URL and Supabase is connected,
 * upload it to Supabase Storage (bucket: 'portfolio') to get a clean CDN public URL.
 */
async function processImageUrlForStorage(
  supabase: any,
  imageUrl?: string
): Promise<string | undefined> {
  if (!imageUrl || !imageUrl.startsWith("data:image/") || !supabase) {
    return imageUrl;
  }

  try {
    const matches = imageUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return imageUrl;

    const rawExt = matches[1];
    const ext = rawExt.includes("png") ? "png" : rawExt.includes("webp") ? "webp" : "jpg";
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const filePath = `packages/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(filePath, buffer, {
        contentType: `image/${ext}`,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.warn("Storage upload for package image warning:", uploadError.message);
      return imageUrl;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio").getPublicUrl(filePath);

    return publicUrl || imageUrl;
  } catch (err) {
    console.warn("Error uploading data URL to storage:", err);
    return imageUrl;
  }
}

export async function GET() {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await getSupabaseClient();
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
    console.error("Error reading packages from Supabase:", err);
  }

  return NextResponse.json({ packages: getStoredPackages() });
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

    const supabase = await getSupabaseClient();
    const processedImageUrl = await processImageUrlForStorage(supabase, image_url);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newPackageData = {
      slug: slug + "-" + Date.now().toString(36),
      name,
      tagline: tagline || "",
      image_url: processedImageUrl || "",
      price: Number(price),
      duration_minutes: Number(duration_minutes),
      photo_count_text: photo_count_text || "Semua File Asli",
      features: Array.isArray(features) ? features : [],
      is_active: is_active ?? true,
      sort_order: Number(sort_order || 0),
    };

    let resultPackage: any = null;

    if (supabase) {
      const { data: inserted, error: insertError } = await supabase
        .from("packages")
        .insert(newPackageData)
        .select()
        .single();

      if (insertError) {
        console.error("[SUPABASE_PACKAGE_INSERT_ERROR]", insertError);
        return NextResponse.json(
          { error: "Gagal menyimpan paket ke database: " + insertError.message },
          { status: 500 }
        );
      }

      resultPackage = inserted;
    }

    const createdLocally = createStoredPackage(resultPackage || newPackageData);
    if (!resultPackage) {
      resultPackage = createdLocally;
    }

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath("/booking");
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ success: true, package: resultPackage });
  } catch (err: unknown) {
    console.error("Create package error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal membuat paket baru." },
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

    const supabase = await getSupabaseClient();
    const processedImageUrl = await processImageUrlForStorage(supabase, image_url);

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (processedImageUrl !== undefined) updateData.image_url = processedImageUrl;
    if (price !== undefined) updateData.price = Number(price);
    if (duration_minutes !== undefined)
      updateData.duration_minutes = Number(duration_minutes);
    if (photo_count_text !== undefined)
      updateData.photo_count_text = photo_count_text;
    if (features !== undefined)
      updateData.features = Array.isArray(features) ? features : [];
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);

    let returnedPackage: any = null;

    if (supabase) {
      const { data: updated, error: updateError } = await supabase
        .from("packages")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("[SUPABASE_PACKAGE_UPDATE_ERROR]", updateError);
        return NextResponse.json(
          { error: "Gagal memperbarui database: " + updateError.message },
          { status: 500 }
        );
      }

      returnedPackage = updated;
    }

    // Update in persistent local file storage
    const updatedLocally = updateStoredPackage(id, updateData);
    if (!returnedPackage) {
      returnedPackage = updatedLocally || { id, ...updateData };
    }

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath("/booking");
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      package: returnedPackage,
    });
  } catch (err: unknown) {
    console.error("Update package error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui paket." },
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

    const supabase = await getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from("packages").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    deleteStoredPackage(id);

    try {
      revalidatePath("/");
      revalidatePath("/packages");
      revalidatePath("/booking");
    } catch (e) {
      // Ignore
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
