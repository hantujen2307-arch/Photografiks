import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import {
  getStoredPortfolio,
  updateStoredPortfolioItem,
  createStoredPortfolioItem,
  deleteStoredPortfolioItem,
} from "@/lib/data/portfolio-store";
import { PortfolioItem } from "@/types";

export const dynamic = "force-dynamic";

async function getSupabaseClient() {
  const adminClient = createAdminSupabaseClient();
  if (adminClient) return adminClient;
  return await createServerSupabaseClient();
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
        .from("portfolio_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ items: data });
      }
    }
  } catch (err) {
    console.error("Error reading portfolio from Supabase:", err);
  }

  // Fallback to local persistent store
  return NextResponse.json({ items: getStoredPortfolio() });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let title = "";
    let category: PortfolioItem["category"] = "Portrait";
    let description = "";
    let isFeatured = false;
    let sortOrder = 0;
    let file: File | null = null;
    let directImageUrl: string | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      title = (formData.get("title") as string) || "";
      category = ((formData.get("category") as string) || "Portrait") as PortfolioItem["category"];
      description = (formData.get("description") as string) || "";
      isFeatured = formData.get("is_featured") === "true";
      sortOrder = Number(formData.get("sort_order") || 0);
      file = formData.get("file") as File | null;
      directImageUrl = formData.get("image_url") as string | null;
    } else {
      const body = await request.json();
      title = body.title || "";
      if (body.category) category = body.category as PortfolioItem["category"];
      description = body.description || "";
      isFeatured = Boolean(body.is_featured);
      sortOrder = Number(body.sort_order || 0);
      directImageUrl = body.image_url || null;
    }

    if (!title.trim()) {
      return NextResponse.json({ error: "Judul foto wajib diisi." }, { status: 400 });
    }

    let finalImageUrl = directImageUrl ? directImageUrl.trim() : "";
    let storagePath: string | null = null;

    const supabase = await getSupabaseClient();

    // 1. Process File Upload to Supabase Storage if file is attached
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "File yang dipilih harus berformat gambar (JPG, PNG, WebP)." },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran file foto maksimal 10MB." },
          { status: 400 }
        );
      }

      if (supabase) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const safeExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
        const filePath = `items/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("[SUPABASE_STORAGE_UPLOAD_ERROR]", uploadError);
          return NextResponse.json(
            { error: `Gagal mengunggah foto ke Supabase Storage: ${uploadError.message}` },
            { status: 500 }
          );
        }

        storagePath = uploadData?.path || filePath;
        const {
          data: { publicUrl },
        } = supabase.storage.from("portfolio").getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "Foto wajib dipilih atau URL foto wajib disertakan." },
        { status: 400 }
      );
    }

    const payload: Omit<PortfolioItem, "id"> = {
      title,
      category,
      description,
      image_url: finalImageUrl,
      storage_path: storagePath || undefined,
      is_featured: isFeatured,
      sort_order: sortOrder,
    };

    let resultItem: PortfolioItem | null = null;

    // 2. Insert into Supabase Database
    if (supabase) {
      const { data: inserted, error: insertError } = await supabase
        .from("portfolio_items")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        console.error("[SUPABASE_DB_INSERT_ERROR]", insertError);
        const prefix = file
          ? "Foto berhasil diunggah ke Storage, namun gagal menyimpan ke database: "
          : "Gagal menyimpan data ke database: ";
        return NextResponse.json(
          { error: prefix + insertError.message },
          { status: 500 }
        );
      }

      resultItem = inserted;
    }

    // 3. Sync to local persistent store
    const storedItem = createStoredPortfolioItem(resultItem || payload);
    if (!resultItem) {
      resultItem = storedItem;
    }

    // 4. Invalidate ISR page cache so public website instantly updates
    try {
      revalidatePath("/");
      revalidatePath("/portfolio");
    } catch (e) {
      // Ignore in non-edge/preview contexts
    }

    return NextResponse.json({ success: true, item: resultItem });
  } catch (err: unknown) {
    console.error("Create portfolio error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Terjadi kesalahan saat memproses portofolio." },
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
    const contentType = request.headers.get("content-type") || "";
    let id = "";
    let title: string | undefined;
    let category: PortfolioItem["category"] | undefined;
    let description: string | undefined;
    let isFeatured: boolean | undefined;
    let sortOrder: number | undefined;
    let directImageUrl: string | undefined;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      id = (formData.get("id") as string) || "";
      if (formData.has("title")) title = formData.get("title") as string;
      if (formData.has("category")) category = formData.get("category") as PortfolioItem["category"];
      if (formData.has("description")) description = formData.get("description") as string;
      if (formData.has("is_featured")) isFeatured = formData.get("is_featured") === "true";
      if (formData.has("sort_order")) sortOrder = Number(formData.get("sort_order"));
      if (formData.has("image_url")) directImageUrl = formData.get("image_url") as string;
      file = formData.get("file") as File | null;
    } else {
      const body = await request.json();
      id = body.id || "";
      title = body.title;
      if (body.category) category = body.category as PortfolioItem["category"];
      description = body.description;
      isFeatured = body.is_featured;
      if (body.sort_order !== undefined) sortOrder = Number(body.sort_order);
      directImageUrl = body.image_url;
    }

    if (!id) {
      return NextResponse.json({ error: "ID portofolio wajib disertakan." }, { status: 400 });
    }

    const supabase = await getSupabaseClient();
    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (isFeatured !== undefined) updateData.is_featured = isFeatured;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;

    // 1. Process File Upload if a new file is attached
    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "File yang dipilih harus berformat gambar (JPG, PNG, WebP)." },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Ukuran file foto maksimal 10MB." },
          { status: 400 }
        );
      }

      if (supabase) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const safeExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
        const filePath = `items/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("portfolio")
          .upload(filePath, buffer, {
            contentType: file.type || "image/jpeg",
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("[SUPABASE_STORAGE_UPLOAD_ERROR]", uploadError);
          return NextResponse.json(
            { error: `Gagal mengunggah foto baru ke Supabase Storage: ${uploadError.message}` },
            { status: 500 }
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("portfolio").getPublicUrl(filePath);

        updateData.image_url = publicUrl;
        updateData.storage_path = uploadData?.path || filePath;
      }
    } else if (directImageUrl && directImageUrl.trim()) {
      updateData.image_url = directImageUrl.trim();
    }

    let returnedItem: PortfolioItem | null = null;

    // 2. Perform Database Update
    if (supabase) {
      const { data: updated, error: updateError } = await supabase
        .from("portfolio_items")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error("[SUPABASE_DB_UPDATE_ERROR]", updateError);
        const prefix = file
          ? "Foto berhasil diunggah ke Storage, namun gagal memperbarui database: "
          : "Gagal memperbarui database: ";
        return NextResponse.json(
          { error: prefix + updateError.message },
          { status: 500 }
        );
      }

      returnedItem = updated;
    }

    // 3. Update persistent local store
    const locallyUpdated = updateStoredPortfolioItem(id, updateData as Partial<PortfolioItem>);
    if (!returnedItem) {
      returnedItem = locallyUpdated;
    }

    if (!returnedItem) {
      return NextResponse.json({ error: "Item portofolio tidak ditemukan." }, { status: 404 });
    }

    // 4. Invalidate ISR page cache so public website instantly updates
    try {
      revalidatePath("/");
      revalidatePath("/portfolio");
    } catch (e) {
      // Ignore in non-edge/preview contexts
    }

    return NextResponse.json({ success: true, item: returnedItem });
  } catch (err: unknown) {
    console.error("Update portfolio error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui portofolio." },
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
      return NextResponse.json({ error: "ID portofolio diperlukan." }, { status: 400 });
    }

    const supabase = await getSupabaseClient();
    if (supabase) {
      // Get item first to check storage_path
      const { data: item } = await supabase
        .from("portfolio_items")
        .select("storage_path")
        .eq("id", id)
        .single();

      if (item?.storage_path) {
        // Clean up Supabase Storage file
        try {
          await supabase.storage.from("portfolio").remove([item.storage_path]);
        } catch (storageErr) {
          console.warn("Storage file cleanup warning:", storageErr);
        }
      }

      const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Clean up local store
    deleteStoredPortfolioItem(id);

    try {
      revalidatePath("/");
      revalidatePath("/portfolio");
    } catch (e) {
      // Ignore
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete portfolio item error:", err);
    return NextResponse.json({ error: "Gagal menghapus portofolio." }, { status: 500 });
  }
}
