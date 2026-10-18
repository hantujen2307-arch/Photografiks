"use client";

import React, { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayoutClient({
  children,
  userEmail,
  userRole,
  isDevBypass,
  title = "Studio Dashboard",
}: {
  children: React.ReactNode;
  userEmail?: string;
  userRole?: string;
  isDevBypass?: boolean;
  title?: string;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          userEmail={userEmail}
          userRole={userRole}
          isDevBypass={isDevBypass}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <AdminSidebar
              userEmail={userEmail}
              userRole={userRole}
              isDevBypass={isDevBypass}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title={title}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          mobileMenuOpen={mobileMenuOpen}
        />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
