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
  const raw =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SECRET ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, "").replace(/[\r\n\t]/g, "").trim();
  if (!cleaned || cleaned.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")) {
    return null;
  }
  return cleaned;
}

/**
 * Safe diagnostics for environment configuration (exposes NO secrets)
 */
export function getSupabaseConfigDiagnostics() {
  const url = getSanitizedSupabaseUrl();
  const serviceRoleKey = getSanitizedSupabaseServiceRoleKey();
  const anonKey = getSanitizedSupabaseAnonKey();

  let projectHostname = "none";
  try {
    if (url) projectHostname = new URL(url).hostname;
  } catch {}

  const getKeyFormat = (k: string | null) => {
    if (!k) return "missing";
    if (k.startsWith("eyJ")) return "jwt";
    if (k.startsWith("sb_secret_")) return "new_secret_key";
    if (k.startsWith("sb_publishable_")) return "new_publishable_key";
    return "custom_or_other";
  };

  return {
    hasUrl: Boolean(url),
    projectHostname,
    hasServiceRoleKey: Boolean(serviceRoleKey),
    serviceRoleKeyFormat: getKeyFormat(serviceRoleKey),
    serviceRoleKeyLength: serviceRoleKey ? serviceRoleKey.length : 0,
    hasAnonKey: Boolean(anonKey),
    anonKeyFormat: getKeyFormat(anonKey),
  };
}
