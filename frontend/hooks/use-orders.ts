"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/server/api-client";
import type {
  ApiResponse,
  Order,
  OrderTracking,
  PlaceOrderInput,
  TrackOrderInput,
} from "@/server/types";

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      const response = await apiClient.post<ApiResponse<Order>>(
        "/orders",
        input,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useTrackOrder(input: TrackOrderInput | undefined) {
  return useQuery({
    queryKey: ["orders", "tracking", input],
    queryFn: async () => {
      const response = await apiClient.post<ApiResponse<OrderTracking>>(
        "/orders/track",
        input,
      );
      return response.data.data;
    },
    enabled: Boolean(input?.orderId && input.customerPhone),
    retry: false,
  });
}
