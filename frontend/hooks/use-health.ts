"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/server/api-client";
import type { ApiResponse } from "@/server/types";

export type HealthStatus = {
  status: "ok";
  uptime: number;
  timestamp: string;
};

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response =
        await apiClient.get<ApiResponse<HealthStatus>>("/health");
      return response.data.data;
    },
    refetchInterval: 60_000,
  });
}
