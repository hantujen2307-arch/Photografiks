import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  createAdminSupabaseClient,
  uploadToSupabaseStorage,
} from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import {
  getStoredPortfolio,
  updateStoredPortfolioItem,
  createStoredPortfolioItem,
  deleteStoredPortfolioItem,
  toPortfolioUuid,
} from "@/lib/data/portfolio-store";
import { PortfolioItem } from "@/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

  // Fallback to local persistent store (which returns canonical UUIDs)
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
    let storagePath = "";

    // 1. Process File Upload if a file is attached
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

      const fileExt = file.name.split(".").pop() || "jpg";
      const safeExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
      const filePath = `items/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadRes = await uploadToSupabaseStorage(
        "portfolio",
        filePath,
        buffer,
        file.type || "image/jpeg"
      );

      if (uploadRes.error) {
        return NextResponse.json({ error: uploadRes.error }, { status: 500 });
      }

      storagePath = filePath;
      finalImageUrl = uploadRes.url || "";
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
    const supabase = await getSupabaseClient();
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
          { error: prefix + insertError.message, uploadedImageUrl: finalImageUrl || undefined },
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
    } catch {
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

    if (!id || !id.trim()) {
      return NextResponse.json({ error: "ID portofolio wajib disertakan." }, { status: 400 });
    }

    // Resolve legacy ID (like 'port-8') to valid canonical UUID
    const targetUuid = toPortfolioUuid(id.trim());
    const supabase = await getSupabaseClient();

    // Fallback item from local store
    const localList = getStoredPortfolio();
    const existingLocal = localList.find((p) => p.id === id || toPortfolioUuid(p.id) === targetUuid);

    // Find if this record already exists in Supabase
    let existingDbItem: PortfolioItem | null = null;
    if (supabase) {
      try {
        const { data: byId } = await supabase
          .from("portfolio_items")
          .select("*")
          .eq("id", targetUuid)
          .maybeSingle();

        if (byId) {
          existingDbItem = byId;
        } else if (title) {
          const { data: byTitle } = await supabase
            .from("portfolio_items")
            .select("*")
            .eq("title", title)
            .maybeSingle();
          if (byTitle) {
            existingDbItem = byTitle;
          }
        }
      } catch (checkErr) {
        console.warn("[SUPABASE_ITEM_LOOKUP_WARNING]", checkErr);
      }
    }

    const actualDbId = existingDbItem ? existingDbItem.id : targetUuid;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (isFeatured !== undefined) updateData.is_featured = isFeatured;
    if (sortOrder !== undefined) updateData.sort_order = sortOrder;

    // 1. Process File Upload if a new file is attached
    let finalImageUrl = directImageUrl && directImageUrl.trim() ? directImageUrl.trim() : "";

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

      const fileExt = file.name.split(".").pop() || "jpg";
      const safeExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;
      const filePath = `items/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadRes = await uploadToSupabaseStorage(
        "portfolio",
        filePath,
        buffer,
        file.type || "image/jpeg"
      );

      if (uploadRes.error) {
        return NextResponse.json({ error: uploadRes.error }, { status: 500 });
      }

      finalImageUrl = uploadRes.url || "";
      updateData.image_url = finalImageUrl;
      updateData.storage_path = filePath;
    } else if (finalImageUrl) {
      updateData.image_url = finalImageUrl;
    }

    let returnedItem: PortfolioItem | null = null;

    // 2. Perform Database Update or Upsert
    if (supabase) {
      try {
        if (existingDbItem) {
          const { data: updated, error: updateError } = await supabase
            .from("portfolio_items")
            .update(updateData)
            .eq("id", actualDbId)
            .select()
            .single();

          if (updateError) {
            console.error("[SUPABASE_DB_UPDATE_ERROR]", updateError);
            const prefix = file
              ? "Foto berhasil diunggah ke Storage, namun gagal memperbarui database: "
              : "Gagal memperbarui database: ";
            return NextResponse.json(
              { error: prefix + updateError.message, uploadedImageUrl: finalImageUrl || undefined },
              { status: 500 }
            );
          }

          returnedItem = updated;
        } else {
          // Row does not exist in DB yet (e.g. first edit of default portfolio item) -> UPSERT with canonical UUID
          const fullItemPayload = {
            id: actualDbId,
            title: title || existingLocal?.title || "Untitled",
            category: category || existingLocal?.category || "Portrait",
            description: description !== undefined ? description : (existingLocal?.description || ""),
            image_url: updateData.image_url || existingLocal?.image_url || finalImageUrl || "",
            storage_path: updateData.storage_path || existingLocal?.storage_path || null,
            is_featured: isFeatured !== undefined ? isFeatured : (existingLocal?.is_featured || false),
            sort_order: sortOrder !== undefined ? sortOrder : (existingLocal?.sort_order || 0),
          };

          const { data: upserted, error: upsertError } = await supabase
            .from("portfolio_items")
            .upsert(fullItemPayload)
            .select()
            .single();

          if (upsertError) {
            console.error("[SUPABASE_DB_UPSERT_ERROR]", upsertError);
            const prefix = file
              ? "Foto berhasil diunggah ke Storage, namun gagal menyimpan ke database: "
              : "Gagal menyimpan ke database: ";
            return NextResponse.json(
              { error: prefix + upsertError.message, uploadedImageUrl: finalImageUrl || undefined },
              { status: 500 }
            );
          }

          returnedItem = upserted;
        }
      } catch (dbErr: unknown) {
        console.error("[SUPABASE_DB_EXCEPTION]", dbErr);
        const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
        return NextResponse.json(
          {
            error: `Gagal memperbarui database Supabase (${msg}).`,
            uploadedImageUrl: finalImageUrl || undefined,
          },
          { status: 500 }
        );
      }
    }

    // 3. Update persistent local store
    const locallyUpdated = updateStoredPortfolioItem(id, {
      ...updateData,
      id: actualDbId,
    } as Partial<PortfolioItem>);

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
    } catch {
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

    if (!id || !id.trim()) {
      return NextResponse.json({ error: "ID portofolio diperlukan." }, { status: 400 });
    }

    const targetUuid = toPortfolioUuid(id.trim());
    const supabase = await getSupabaseClient();
    if (supabase) {
      // Get item first to check storage_path
      const { data: item } = await supabase
        .from("portfolio_items")
        .select("storage_path")
        .eq("id", targetUuid)
        .maybeSingle();

      if (item?.storage_path) {
        // Clean up Supabase Storage file
        try {
          await supabase.storage.from("portfolio").remove([item.storage_path]);
        } catch (storageErr) {
          console.warn("Storage file cleanup warning:", storageErr);
        }
      }

      const { error } = await supabase.from("portfolio_items").delete().eq("id", targetUuid);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    // Clean up local store
    deleteStoredPortfolioItem(id);

    try {
      revalidatePath("/");
      revalidatePath("/portfolio");
    } catch {
      // Ignore
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete portfolio item error:", err);
    return NextResponse.json({ error: "Gagal menghapus portofolio." }, { status: 500 });
  }
}
