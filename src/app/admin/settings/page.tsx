import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { verifyAdminSession } from "@/lib/auth/admin-guard";
import SettingsClient from "./SettingsClient";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Pengaturan Konten Website | MOMEN.POTRAIT Admin",
};

export default async function AdminSettingsPage() {
  const auth = await verifyAdminSession();

  if (!auth.isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutClient
      title="Pengaturan Konten &amp; Media Studio"
      userEmail={auth.user?.email}
      userRole={auth.user?.role}
      isDevBypass={auth.isDevBypass}
    >
      <Suspense
        fallback={
          <div className="py-20 flex flex-col items-center justify-center text-sm text-[#6B6862]">
            <Loader2 className="w-8 h-8 animate-spin text-[#161514] mb-3" />
            <span>Memuat pengaturan...</span>
          </div>
        }
      >
        <SettingsClient />
      </Suspense>
    </AdminLayoutClient>
  );
}
