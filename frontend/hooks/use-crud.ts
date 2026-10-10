"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DEFAULT_LIST_PARAMS, normalizeListParams } from "@/server/types";
import type { ListParams, PaginatedData } from "@/server/types";

export type CrudApi<T> = {
  list: (params?: ListParams) => Promise<PaginatedData<T>>;
  get: (id: string) => Promise<T>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: string, data: Record<string, unknown>) => Promise<T>;
  replace: (id: string, data: Record<string, unknown>) => Promise<T>;
  remove: (id: string) => Promise<T>;
};

export type CrudUpdateInput = { id: string; data: Record<string, unknown> };

export function useCrudList<T>(
  resourceKey: readonly string[],
  api: CrudApi<T>,
  params: ListParams = DEFAULT_LIST_PARAMS,
) {
  const pagination = normalizeListParams(params);

  return useQuery({
    queryKey: [...resourceKey, "list", pagination],
    queryFn: () => api.list(pagination),
    placeholderData: keepPreviousData,
  });
}

export function useCrudDetail<T>(
  resourceKey: readonly string[],
  api: CrudApi<T>,
  id: string | undefined,
) {
  return useQuery({
    queryKey: [...resourceKey, "detail", id],
    queryFn: () => api.get(id!),
    enabled: Boolean(id),
  });
}

export function useCrudMutations<T>(
  resourceKey: readonly string[],
  api: CrudApi<T>,
) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: resourceKey });

  const create = useMutation({ mutationFn: api.create, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, data }: CrudUpdateInput) => api.update(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: resourceKey });
      void queryClient.invalidateQueries({
        queryKey: [...resourceKey, "detail", variables.id],
      });
    },
  });
  const replace = useMutation({
    mutationFn: ({ id, data }: CrudUpdateInput) => api.replace(id, data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: resourceKey });
      void queryClient.invalidateQueries({
        queryKey: [...resourceKey, "detail", variables.id],
      });
    },
  });
  const remove = useMutation({
    mutationFn: api.remove,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: resourceKey });
      void queryClient.removeQueries({
        queryKey: [...resourceKey, "detail", id],
        exact: true,
      });
    },
  });

  return { create, update, replace, remove };
}
