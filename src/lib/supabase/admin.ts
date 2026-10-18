import { createClient } from "@supabase/supabase-js";
import {
  getSanitizedSupabaseUrl,
  getSanitizedSupabaseServiceRoleKey,
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
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // 12 second timeout to prevent hanging requests on Vercel
          signal: options?.signal || AbortSignal.timeout(12000),
        });
      },
    },
  });
}
