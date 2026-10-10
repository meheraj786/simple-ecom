"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import apiClient from "@/server/api-client";
import { DEFAULT_LIST_PARAMS, normalizeListParams } from "@/server/types";
import type { ApiResponse, DashboardStats, ListParams } from "@/server/types";

export function useAdminDashboard(params: ListParams = DEFAULT_LIST_PARAMS) {
  const pagination = normalizeListParams(params);

  return useQuery({
    queryKey: ["admin", "dashboard", pagination],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        "/admin/dashboard",
        { params: pagination },
      );
      return response.data.data;
    },
    placeholderData: keepPreviousData,
  });
}
