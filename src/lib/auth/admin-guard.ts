import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AdminAuthResult {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  } | null;
  error?: string;
  isDevBypass?: boolean;
}

export async function verifyAdminSession(): Promise<AdminAuthResult> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    // If Supabase environment variables are not configured yet,
    // allow preview mode with dev flag
    return {
      isAuthenticated: true,
      user: {
        id: "preview-admin",
        email: "admin@momenpotrait.com",
        fullName: "Studio Admin (Preview Mode)",
        role: "superadmin",
      },
      isDevBypass: true,
    };
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        isAuthenticated: false,
        user: null,
        error: "Sesi tidak ditemukan atau telah berakhir.",
      };
    }

    // Verify admin profile in public.admin_profiles
    const { data: profile, error: profileError } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        isAuthenticated: false,
        user: null,
        error: "Pengguna terautentikasi tetapi tidak memiliki akses administrator studio.",
      };
    }

    return {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email || profile.email,
        fullName: profile.full_name || "Admin Studio",
        role: profile.role,
      },
    };
  } catch (err: unknown) {
    console.error("verifyAdminSession error:", err);
    return {
      isAuthenticated: false,
      user: null,
      error: "Terjadi kesalahan internal saat memeriksa otorisasi.",
    };
  }
}
