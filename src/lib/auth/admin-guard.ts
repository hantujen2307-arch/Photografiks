import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  isValidSession,
  getAdminCredentials,
} from "@/lib/auth/admin-auth";

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
  // 1. Check password session cookie
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (isValidSession(sessionToken)) {
      const creds = getAdminCredentials();
      return {
        isAuthenticated: true,
        user: {
          id: "admin-master",
          email: creds.email,
          fullName: "Studio Administrator",
          role: "superadmin",
        },
        isDevBypass: false,
      };
    }
  } catch (cookieErr: unknown) {
    if ((cookieErr as { digest?: string })?.digest !== "DYNAMIC_SERVER_USAGE") {
      console.error("Cookie verification error:", cookieErr);
    }
  }

  // 2. Check Supabase Auth if configured
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (!authError && user) {
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!profileError && profile) {
          return {
            isAuthenticated: true,
            user: {
              id: user.id,
              email: user.email || profile.email,
              fullName: profile.full_name || "Admin Studio",
              role: profile.role,
            },
          };
        }
      }
    }
  } catch (supabaseErr) {
    console.error("Supabase verification error:", supabaseErr);
  }

  // 3. Not authenticated
  return {
    isAuthenticated: false,
    user: null,
    error: "Sesi tidak ditemukan atau kata sandi belum dimasukkan.",
  };
}
