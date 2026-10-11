"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 30_000, retry: 1 },
        mutations: { retry: 0 },
      },
    });
  }

  browserQueryClient ??= new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
      mutations: { retry: 0 },
    },
  });
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
