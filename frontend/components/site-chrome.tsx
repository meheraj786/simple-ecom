"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

function SiteChromeContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminArea =
    pathname === "/admin-login" ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  return (
    <>
      {!isAdminArea && <Navbar />}
      {children}
      {!isAdminArea && <Footer />}
    </>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={children}>
      <SiteChromeContent>{children}</SiteChromeContent>
    </Suspense>
  );
}
