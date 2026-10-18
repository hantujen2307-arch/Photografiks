import { createClient } from "@supabase/supabase-js";
import {
  getSanitizedSupabaseUrl,
  getSanitizedSupabaseServiceRoleKey,
  getSupabaseConfigDiagnostics,
} from "./config";

export function createAdminSupabaseClient() {
  const supabaseUrl = getSanitizedSupabaseUrl();
  const serviceRoleKey = getSanitizedSupabaseServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Direct REST upload to Supabase Storage with comprehensive error diagnostics.
 * Completely avoids SDK stream/FormData locking bugs in serverless environments.
 */
export async function uploadToSupabaseStorage(
  bucketName: string,
  filePath: string,
  fileBody: Buffer | Uint8Array,
  contentType: string = "image/jpeg"
): Promise<{ url?: string; error?: string; status?: number }> {
  const supabaseUrl = getSanitizedSupabaseUrl();
  const serviceRoleKey = getSanitizedSupabaseServiceRoleKey();
  const diag = getSupabaseConfigDiagnostics();

  console.log("[STORAGE_DIAGNOSTICS_PRE_UPLOAD]", {
    bucketName,
    filePath,
    byteLength: fileBody.byteLength,
    contentType,
    ...diag,
  });

  if (!supabaseUrl) {
    return {
      error: "NEXT_PUBLIC_SUPABASE_URL belum diatur di Environment Variables Vercel.",
    };
  }

  if (!serviceRoleKey) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY belum diatur di Environment Variables Vercel. Kunci ini wajib untuk mengizinkan upload file di server.",
    };
  }

  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`;

  const payloadBody = new Uint8Array(
    fileBody.buffer,
    fileBody.byteOffset,
    fileBody.byteLength
  ) as unknown as BodyInit;

  try {
    const res = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": contentType,
        "cache-control": "max-age=3600",
        "x-upsert": "true",
      },
      body: payloadBody,
      signal: AbortSignal.timeout(45000),
    });

    const responseText = await res.text();
    let responseJson: { message?: string; error?: string } | null = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      // not json
    }

    console.log("[STORAGE_UPLOAD_RESPONSE]", {
      status: res.status,
      statusText: res.statusText,
      response: responseJson || responseText.slice(0, 200),
    });

    if (res.ok) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
      return { url: publicUrl, status: res.status };
    }

    // Auto-create bucket if missing (404)
    if (res.status === 404 || responseJson?.message?.toLowerCase().includes("not found")) {
      console.warn("[STORAGE_BUCKET_404] Mencoba membuat bucket publik:", bucketName);
      try {
        const createBucketRes = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
          method: "POST",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: bucketName,
            name: bucketName,
            public: true,
            file_size_limit: 10485760, // 10MB
            allowed_mime_types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
          }),
          signal: AbortSignal.timeout(15000),
        });

        if (createBucketRes.ok) {
          // Retry upload once after bucket creation
          const retryRes = await fetch(uploadUrl, {
            method: "POST",
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
              "Content-Type": contentType,
              "cache-control": "max-age=3600",
              "x-upsert": "true",
            },
            body: payloadBody,
            signal: AbortSignal.timeout(45000),
          });

          if (retryRes.ok) {
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
            return { url: publicUrl, status: retryRes.status };
          }
        }
      } catch (createErr) {
        console.warn("[STORAGE_CREATE_BUCKET_ERROR]", createErr);
      }
    }

    // Categorized descriptive errors based on HTTP status
    if (res.status === 401 || res.status === 403) {
      const detail = responseJson?.message || responseJson?.error || res.statusText;
      return {
        status: res.status,
        error: `Izin Storage ditolak (${res.status} ${detail}). Pastikan SUPABASE_SERVICE_ROLE_KEY di Vercel adalah service_role secret key yang valid untuk project ${diag.projectHostname}.`,
      };
    }

    if (res.status === 404) {
      return {
        status: 404,
        error: `Bucket '${bucketName}' tidak ditemukan di Supabase Storage project ${diag.projectHostname}. Pastikan bucket 'portfolio' sudah dibuat di Supabase Dashboard > Storage.`,
      };
    }

    return {
      status: res.status,
      error: `Supabase Storage error (${res.status}): ${responseJson?.message || responseText.slice(0, 100)}`,
    };
  } catch (networkErr: unknown) {
    const err = networkErr as {
      name?: string;
      message?: string;
      code?: string;
      cause?: { code?: string; message?: string };
    };
    const isTimeout = err?.name === "TimeoutError";
    const causeCode = err?.cause?.code || err?.code;
    const causeMsg = err?.cause?.message || err?.message;

    console.error("[STORAGE_NETWORK_ERROR]", {
      name: err?.name,
      message: err?.message,
      causeCode,
      causeMsg,
      target: supabaseUrl,
    });

    if (isTimeout) {
      return {
        error: "Upload timeout (melebihi 45 detik). Ukuran file foto terlalu besar atau koneksi lambat.",
      };
    }

    return {
      error: `Gagal terhubung ke Supabase Storage (${causeCode || err?.message || "fetch failed"}) pada ${diag.projectHostname}. Periksa koneksi atau status project.`,
    };
  }
}
