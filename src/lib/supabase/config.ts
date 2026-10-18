/**
 * MOMEN.POTRAIT — SUPABASE CONFIGURATION & URL NORMALIZATION
 * Ensures all Supabase requests use valid, HTTPS, trimmed URLs without trailing slashes
 * or unhandled whitespace that cause Node.js fetch to throw "TypeError: fetch failed".
 */

export function getSanitizedSupabaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").replace(/[\r\n\t]/g, "").trim();
  if (!cleaned) return null;

  try {
    const formatted = cleaned.startsWith("http://") || cleaned.startsWith("https://")
      ? cleaned
      : `https://${cleaned}`;
    const url = new URL(formatted);
    // Discard template placeholder strings
    if (!url.hostname || url.hostname.includes("your-project-id")) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getSanitizedSupabaseAnonKey(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").replace(/[\r\n\t]/g, "").trim();
  if (!cleaned || cleaned.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")) {
    return null;
  }
  return cleaned;
}

export function getSanitizedSupabaseServiceRoleKey(): string | null {
  const raw = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").replace(/[\r\n\t]/g, "").trim();
  if (!cleaned || cleaned.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")) {
    return null;
  }
  return cleaned;
}
