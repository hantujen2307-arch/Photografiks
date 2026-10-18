import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminCredentials,
  generateSessionToken,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    const creds = getAdminCredentials();

    if (password.trim() !== creds.password) {
      return NextResponse.json(
        { error: "Kata sandi salah. Silakan masukkan kata sandi yang benar." },
        { status: 401 }
      );
    }

    const token = generateSessionToken(creds.password);

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    });

    return NextResponse.json({
      success: true,
      user: {
        email: creds.email,
        role: "superadmin",
      },
      message: "Berhasil masuk ke dashboard admin.",
    });
  } catch (err: unknown) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan sistem saat memproses login." },
      { status: 500 }
    );
  }
}
