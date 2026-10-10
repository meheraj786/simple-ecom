"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/server/api-client";
import type { ApiResponse, User } from "@/server/types";

export function startGoogleLogin() {
  // Google OAuth starts on the backend origin, outside Next.js routing.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${apiClient.defaults.baseURL}/auth/google`;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      return response.data.data;
    },
    retry: false,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<ApiResponse<null>>("/auth/logout");
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.setQueryData(["auth", "me"], null);
      await queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
