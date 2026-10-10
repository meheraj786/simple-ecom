import type { AxiosResponse } from "axios";
import apiClient from "./api-client";
import { DEFAULT_LIST_PARAMS, normalizeListParams } from "./types";
import type { ApiResponse, ListParams, PaginatedData } from "./types";

async function unwrap<T>(request: Promise<AxiosResponse<ApiResponse<T>>>) {
  const response = await request;
  return response.data.data;
}

export function createCrudApi<T>(resourcePath: string) {
  return {
    list: (params: ListParams = DEFAULT_LIST_PARAMS) =>
      unwrap<PaginatedData<T>>(
        apiClient.get(`/${resourcePath}`, {
          params: normalizeListParams(params),
        }),
      ),
    get: (id: string) => unwrap<T>(apiClient.get(`/${resourcePath}/${id}`)),
    create: (data: Record<string, unknown>) =>
      unwrap<T>(apiClient.post(`/${resourcePath}`, data)),
    update: (id: string, data: Record<string, unknown>) =>
      unwrap<T>(apiClient.patch(`/${resourcePath}/${id}`, data)),
    replace: (id: string, data: Record<string, unknown>) =>
      unwrap<T>(apiClient.put(`/${resourcePath}/${id}`, data)),
    remove: (id: string) =>
      unwrap<T>(apiClient.delete(`/${resourcePath}/${id}`)),
  };
}
