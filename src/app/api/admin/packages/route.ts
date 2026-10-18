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
export const maxDuration = 60;

async function getSupabaseClient() {
  const adminClient = createAdminSupabaseClient();
  if (adminClient) return adminClient;
  return await createServerSupabaseClient();
}

/**
 * Upload binary file or base64 Data URL to Supabase Storage bucket 'portfolio'.
 * Uses createAdminSupabaseClient (service-role) to ensure RLS bypass and bucket administration.
 */
async function uploadPackageImage(
  supabase: any,
  fileOrDataUrl: File | string
): Promise<{ url?: string; error?: string }> {
  // Always prioritize the admin client with service_role key for Storage writes
  const storageClient = createAdminSupabaseClient() || supabase;
  if (!storageClient) {
    return {
      error:
        "Supabase client tidak tersedia. Pastikan SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_URL sudah diatur di Environment Variables Vercel.",
    };
  }

  try {
    let fileBody: File | Buffer;
    let ext = "jpg";
    let contentType = "image/jpeg";

    if (typeof fileOrDataUrl === "string") {
      const matches = fileOrDataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (!matches) {
        return { url: fileOrDataUrl }; // Standard URL, no upload needed
      }
      const rawExt = matches[1];
      ext = rawExt.includes("png") ? "png" : rawExt.includes("webp") ? "webp" : "jpg";
      contentType = `image/${ext}`;
      fileBody = Buffer.from(matches[2], "base64");
    } else {
      const fileExt = fileOrDataUrl.name.split(".").pop() || "jpg";
      ext = fileExt.toLowerCase().replace(/[^a-z0-9]/g, "");
      contentType = fileOrDataUrl.type || `image/${ext}`;
      // Pass the File directly so Supabase Storage can stream it via FormData
      fileBody = fileOrDataUrl;
    }

    // 1. Proactively ensure bucket 'portfolio' exists in Supabase Storage
    try {
      const { data: bucketData, error: bucketCheckError } = await storageClient.storage.getBucket("portfolio");
      if (bucketCheckError || !bucketData) {
        await storageClient.storage.createBucket("portfolio", {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
        });
      }
    } catch (bucketInitErr) {
      console.warn("[BUCKET_INIT_WARNING]", bucketInitErr);
    }

    // 2. Upload file to 'packages/' folder
    const filePath = `packages/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    let { error: uploadError } = await storageClient.storage
      .from("portfolio")
      .upload(filePath, fileBody, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    // If bucket was still missing on first attempt, retry after creation
    if (uploadError && (uploadError.message?.toLowerCase().includes("not found") || uploadError.message?.toLowerCase().includes("bucket"))) {
      try {
        await storageClient.storage.createBucket("portfolio", { public: true });
        const retry = await storageClient.storage
          .from("portfolio")
          .upload(filePath, fileBody, {
            contentType,
            cacheControl: "3600",
            upsert: false,
          });
        uploadError = retry.error;
      } catch (bucketErr) {
        console.warn("[BUCKET_CREATE_RETRY_WARNING]", bucketErr);
      }
    }

    if (uploadError) {
      console.error("[STORAGE_UPLOAD_ERROR]", uploadError);
      const isFetchFailed = uploadError.message?.toLowerCase().includes("fetch failed");
      const cleanMsg = isFetchFailed
        ? "Koneksi ke Supabase Storage timeout atau terputus. Pastikan URL Supabase valid, project Supabase aktif (tidak paused), dan bucket 'portfolio' dapat diakses."
        : `Gagal mengunggah foto paket ke Storage: ${uploadError.message}`;
      return { error: cleanMsg };
    }

    const {
      data: { publicUrl },
    } = storageClient.storage.from("portfolio").getPublicUrl(filePath);

    return { url: publicUrl || undefined };
  } catch (err: unknown) {
    console.error("[STORAGE_UPLOAD_EXCEPTION]", err);
    return { error: err instanceof Error ? err.message : "Gagal memproses file gambar." };
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
    const contentType = request.headers.get("content-type") || "";
    let name = "";
    let tagline = "";
    let price = 0;
    let duration_minutes = 60;
    let photo_count_text = "";
    let features: string[] = [];
    let is_active = true;
    let sort_order = 0;
    let directImageUrl: string | undefined;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = (formData.get("name") as string) || "";
      tagline = (formData.get("tagline") as string) || "";
      price = Number(formData.get("price") || 0);
      duration_minutes = Number(formData.get("duration_minutes") || 60);
      photo_count_text = (formData.get("photo_count_text") as string) || "";
      const rawFeatures = formData.get("features");
      if (typeof rawFeatures === "string") {
        try {
          features = JSON.parse(rawFeatures);
        } catch {
          features = rawFeatures.split("\n").map((f) => f.trim()).filter(Boolean);
        }
      }
      is_active = formData.get("is_active") === "true";
      sort_order = Number(formData.get("sort_order") || 0);
      file = formData.get("file") as File | null;
      directImageUrl = (formData.get("image_url") as string) || undefined;
    } else {
      const body = await request.json();
      name = body.name || "";
      tagline = body.tagline || "";
      price = Number(body.price || 0);
      duration_minutes = Number(body.duration_minutes || 60);
      photo_count_text = body.photo_count_text || "";
      features = Array.isArray(body.features) ? body.features : [];
      is_active = body.is_active ?? true;
      sort_order = Number(body.sort_order || 0);
      directImageUrl = body.image_url;
    }

    if (!name || price === undefined || !duration_minutes) {
      return NextResponse.json(
        { error: "Nama, harga, dan durasi wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();
    let finalImageUrl = directImageUrl || "";

    // Upload to Supabase Storage if file attached or Data URL provided
    if (supabase) {
      if (file && file.size > 0) {
        const uploadResult = await uploadPackageImage(supabase, file);
        if (uploadResult.error) {
          return NextResponse.json({ error: uploadResult.error }, { status: 500 });
        }
        if (uploadResult.url) finalImageUrl = uploadResult.url;
      } else if (directImageUrl && directImageUrl.startsWith("data:image/")) {
        const uploadResult = await uploadPackageImage(supabase, directImageUrl);
        if (uploadResult.error) {
          return NextResponse.json({ error: uploadResult.error }, { status: 500 });
        }
        if (uploadResult.url) finalImageUrl = uploadResult.url;
      }
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const newPackageData = {
      slug: slug + "-" + Date.now().toString(36),
      name,
      tagline: tagline || "",
      image_url: finalImageUrl || "",
      price: Number(price),
      duration_minutes: Number(duration_minutes),
      photo_count_text: photo_count_text || "Semua File Asli",
      features: Array.isArray(features) ? features : [],
      is_active: is_active ?? true,
      sort_order: Number(sort_order || 0),
    };

    let resultPackage: any = null;

    if (supabase) {
      try {
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
      } catch (err: unknown) {
        console.error("[SUPABASE_INSERT_EXCEPTION]", err);
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          { error: `Gagal menghubungi database Supabase (${msg}).` },
          { status: 500 }
        );
      }
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
    const contentType = request.headers.get("content-type") || "";
    let id = "";
    let name: string | undefined;
    let tagline: string | undefined;
    let price: number | undefined;
    let duration_minutes: number | undefined;
    let photo_count_text: string | undefined;
    let features: string[] | undefined;
    let is_active: boolean | undefined;
    let sort_order: number | undefined;
    let directImageUrl: string | undefined;
    let file: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      id = (formData.get("id") as string) || "";
      if (formData.has("name")) name = formData.get("name") as string;
      if (formData.has("tagline")) tagline = formData.get("tagline") as string;
      if (formData.has("price")) price = Number(formData.get("price"));
      if (formData.has("duration_minutes")) duration_minutes = Number(formData.get("duration_minutes"));
      if (formData.has("photo_count_text")) photo_count_text = formData.get("photo_count_text") as string;
      if (formData.has("features")) {
        const rawFeatures = formData.get("features");
        if (typeof rawFeatures === "string") {
          try {
            features = JSON.parse(rawFeatures);
          } catch {
            features = rawFeatures.split("\n").map((f) => f.trim()).filter(Boolean);
          }
        }
      }
      if (formData.has("is_active")) is_active = formData.get("is_active") === "true";
      if (formData.has("sort_order")) sort_order = Number(formData.get("sort_order"));
      if (formData.has("image_url")) directImageUrl = formData.get("image_url") as string;
      file = formData.get("file") as File | null;
    } else {
      const body = await request.json();
      id = body.id || "";
      name = body.name;
      tagline = body.tagline;
      if (body.price !== undefined) price = Number(body.price);
      if (body.duration_minutes !== undefined) duration_minutes = Number(body.duration_minutes);
      photo_count_text = body.photo_count_text;
      if (body.features !== undefined) features = Array.isArray(body.features) ? body.features : [];
      if (body.is_active !== undefined) is_active = body.is_active;
      if (body.sort_order !== undefined) sort_order = Number(body.sort_order);
      directImageUrl = body.image_url;
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID paket diperlukan" },
        { status: 400 }
      );
    }

    const supabase = await getSupabaseClient();
    let finalImageUrl = directImageUrl;

    // Upload to Supabase Storage if file attached or Data URL provided
    if (supabase) {
      if (file && file.size > 0) {
        const uploadResult = await uploadPackageImage(supabase, file);
        if (uploadResult.error) {
          return NextResponse.json({ error: uploadResult.error }, { status: 500 });
        }
        if (uploadResult.url) finalImageUrl = uploadResult.url;
      } else if (directImageUrl && directImageUrl.startsWith("data:image/")) {
        const uploadResult = await uploadPackageImage(supabase, directImageUrl);
        if (uploadResult.error) {
          return NextResponse.json({ error: uploadResult.error }, { status: 500 });
        }
        if (uploadResult.url) finalImageUrl = uploadResult.url;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (finalImageUrl !== undefined && !finalImageUrl.startsWith("blob:")) {
      updateData.image_url = finalImageUrl;
    }
    if (price !== undefined) updateData.price = price;
    if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
    if (photo_count_text !== undefined) updateData.photo_count_text = photo_count_text;
    if (features !== undefined) updateData.features = features;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (sort_order !== undefined) updateData.sort_order = sort_order;

    let returnedPackage: any = null;

    if (supabase) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let updateQuery = supabase.from("packages").update(updateData);

        if (isUuid) {
          updateQuery = updateQuery.eq("id", id);
        } else {
          // If id is not a standard UUID (e.g. 'pkg-2'), safely target by name or slug
          if (name) {
            updateQuery = updateQuery.eq("name", name);
          } else {
            updateQuery = updateQuery.eq("id", id);
          }
        }

        const { data: updated, error: updateError } = await updateQuery
          .select()
          .maybeSingle();

        if (updateError) {
          console.error("[SUPABASE_PACKAGE_UPDATE_ERROR]", updateError);
          return NextResponse.json(
            { error: "Gagal memperbarui database: " + updateError.message },
            { status: 500 }
          );
        }

        returnedPackage = updated;
      } catch (err: unknown) {
        console.error("[SUPABASE_UPDATE_EXCEPTION]", err);
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          { error: `Gagal memperbarui database: ${msg}` },
          { status: 500 }
        );
      }
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
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        const { error } = await supabase.from("packages").delete().eq("id", id);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
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
