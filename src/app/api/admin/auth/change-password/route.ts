import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  setAdminPassword,
  generateSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth/admin-auth";
import { verifyAdminSession } from "@/lib/auth/admin-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession();
  if (!auth.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal harus 6 karakter." },
        { status: 400 }
      );
    }

    // Save new password
    const success = setAdminPassword(newPassword.trim());
    if (!success) {
      return NextResponse.json(
        { error: "Gagal menyimpan kata sandi baru ke sistem." },
        { status: 500 }
      );
    }

    // Refresh current admin session cookie with the new token
    const newToken = generateSessionToken(newPassword.trim());
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      message: "Kata sandi administrator berhasil diperbarui!",
    });
  } catch (err: unknown) {
    console.error("Change password error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memperbarui kata sandi." },
      { status: 500 }
    );
  }
}
