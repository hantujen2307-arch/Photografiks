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
          // 45 second timeout for image uploads on Vercel Serverless
          signal: options?.signal || AbortSignal.timeout(45000),
          // Ensure duplex mode is specified for request bodies in Node.js 18+ undici
          duplex: (options as any)?.duplex || ((options as any)?.body ? "half" : undefined),
        } as any);
      },
    },
  });
}
