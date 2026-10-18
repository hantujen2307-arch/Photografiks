import fs from "fs";
import path from "path";
import crypto from "crypto";

export const DEFAULT_ADMIN_EMAIL = "admin@momenpotrait.com";
export const DEFAULT_ADMIN_PASSWORD = "admin.potrait123";
export const ADMIN_COOKIE_NAME = "momen_admin_session";

const AUTH_FILE_PATH = path.join(process.cwd(), "src", "lib", "auth", "admin-credentials.json");

export interface AdminCredentials {
  email: string;
  password: string;
  updatedAt?: string;
}

export function getAdminCredentials(): AdminCredentials {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      const content = fs.readFileSync(AUTH_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.password === "string") {
        return {
          email: parsed.email || DEFAULT_ADMIN_EMAIL,
          password: parsed.password,
          updatedAt: parsed.updatedAt,
        };
      }
    }
  } catch (e) {
    console.error("Failed to read admin credentials:", e);
  }

  return {
    email: DEFAULT_ADMIN_EMAIL,
    password: DEFAULT_ADMIN_PASSWORD,
  };
}

export function setAdminPassword(newPassword: string): boolean {
  try {
    const creds = getAdminCredentials();
    const data: AdminCredentials = {
      email: creds.email,
      password: newPassword,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("Failed to write admin credentials:", e);
    return false;
  }
}

export function generateSessionToken(password: string): string {
  return crypto
    .createHmac("sha256", "momen-potrait-salt-2026")
    .update(`session:${password}`)
    .digest("hex");
}

export function isValidSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const currentCreds = getAdminCredentials();
  const expectedToken = generateSessionToken(currentCreds.password);
  return token === expectedToken;
}
