import { createClient } from "@supabase/supabase-js";
import {
  getSanitizedSupabaseUrl,
  getSanitizedSupabaseAnonKey,
} from "./config";

/**
 * Public Supabase client for reading public data (packages, portfolio, testimonials, settings, faqs).
 * Does NOT access user cookies, enabling static generation and edge CDN caching on Vercel.
 */
let cachedPublicClient: ReturnType<typeof createClient> | null = null;

export function getPublicSupabase() {
  const supabaseUrl = getSanitizedSupabaseUrl();
  const supabaseAnonKey = getSanitizedSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!cachedPublicClient) {
    cachedPublicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: options?.signal || AbortSignal.timeout(6000),
          });
        },
      },
    });
  }

  return cachedPublicClient;
}

/**
 * Safe query execution with strict timeout to prevent hanging SSR / edge execution.
 * If Supabase is slow, paused, or experiencing network latency, immediately falls back.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  fallbackValue: T,
  timeoutMs = 1500
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => {
      resolve(fallbackValue);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (err) {
    clearTimeout(timeoutId!);
    console.warn("Public query failed, returning fallback:", err);
    return fallbackValue;
  }
}
