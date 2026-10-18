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
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const description = (formData.get("description") as string) || "";
    const isFeatured = formData.get("is_featured") === "true";
    const sortOrder = Number(formData.get("sort_order") || 0);
    const file = formData.get("file") as File | null;
    const directImageUrl = formData.get("image_url") as string | null;

    if (!title || !category) {
      return NextResponse.json({ error: "Judul dan kategori wajib diisi." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    let finalImageUrl = directImageUrl || "";
    let storagePath: string | null = null;

    // Handle file upload to Supabase Storage if file is provided
    if (file && supabase) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `items/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("portfolio")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: "Gagal mengunggah foto ke Supabase Storage: " + uploadError.message },
          { status: 500 }
        );
      }

      storagePath = uploadData.path;
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(filePath);
      finalImageUrl = publicUrl;
    }

    if (!finalImageUrl) {
      return NextResponse.json(
        { error: "Foto wajib diunggah atau URL foto wajib disertakan." },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json({
        success: true,
        item: {
          id: "mock-" + Date.now(),
          title,
          category,
          description,
          image_url: finalImageUrl,
          storage_path: storagePath,
          is_featured: isFeatured,
          sort_order: sortOrder,
        },
      });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("portfolio_items")
      .insert({
        title,
        category,
        description,
        image_url: finalImageUrl,
        storage_path: storagePath,
        is_featured: isFeatured,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: inserted });
  } catch (err: unknown) {
    console.error("Upload portfolio error:", err);
    return NextResponse.json({ error: "Gagal memproses portofolio." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, category, description, is_featured, sort_order, image_url } = body;

    if (!id) {
      return NextResponse.json({ error: "ID portofolio diperlukan." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true, item: body });
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (is_featured !== undefined) updateData.is_featured = is_featured;
    if (sort_order !== undefined) updateData.sort_order = Number(sort_order);
    if (image_url) updateData.image_url = image_url;

    const { data, error } = await supabase
      .from("portfolio_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, item: data });
  } catch (err: unknown) {
    console.error("Update portfolio error:", err);
    return NextResponse.json({ error: "Gagal memperbarui portofolio." }, { status: 500 });
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
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    // Get item first to check storage_path
    const { data: item } = await supabase
      .from("portfolio_items")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (item?.storage_path) {
      // Clean up Supabase Storage file
      await supabase.storage.from("portfolio").remove([item.storage_path]);
    }

    const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Delete portfolio item error:", err);
    return NextResponse.json({ error: "Gagal menghapus portofolio." }, { status: 500 });
  }
}
