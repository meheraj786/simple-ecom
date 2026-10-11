"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { useCurrentUser } from "@/hooks/use-auth";

export function AdminRouteGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser.data?.role === "ADMIN";

  useEffect(() => {
    if (currentUser.isPending || isAdmin) return;

    if (currentUser.data) {
      router.replace("/admin-login?access=denied");
      return;
    }

    const pathname = window.location.pathname;
    router.replace(`/admin-login?redirectTo=${encodeURIComponent(pathname)}`);
  }, [currentUser.data, currentUser.isPending, isAdmin, router]);

  if (isAdmin) return children;

  return (
    <main
      className="flex min-h-screen items-center justify-center gap-3 bg-background text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <LoaderCircle className="size-4 animate-spin" />
      Verifying administrator access
    </main>
  );
}
