"use client";

import { useState } from "react";
import { DEFAULT_LIST_PARAMS, normalizeListParams } from "@/server/types";

export function usePagination(initialParams = DEFAULT_LIST_PARAMS) {
  const [page, setCurrentPage] = useState(
    normalizeListParams(initialParams).page,
  );
  const [limit, setCurrentLimit] = useState(
    normalizeListParams(initialParams).limit,
  );

  function goToPage(nextPage: number) {
    setCurrentPage(normalizeListParams({ page: nextPage, limit }).page);
  }

  function changePageSize(nextLimit: number) {
    setCurrentLimit(normalizeListParams({ page: 1, limit: nextLimit }).limit);
    setCurrentPage(1);
  }

  return {
    page,
    limit,
    params: { page, limit },
    goToPage,
    changePageSize,
    reset: () => setCurrentPage(1),
  };
}
