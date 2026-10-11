import type { RequestHandler } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import { createCrudController } from "../crud/crud.controller.js";
import {
  getProductByIdOrSlug,
  listProducts,
  productService,
} from "./product.service.js";

const crudController = createCrudController(productService, "products");

function queryString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function queryList(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export const listProductsController: RequestHandler = async (
  request,
  response,
) => {
  const page = Math.max(
    1,
    Number.parseInt(String(request.query.page ?? "1"), 10) || 1,
  );
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(String(request.query.limit ?? "20"), 10) || 20),
  );
  const minPriceValue = queryString(request.query.minPrice);
  const maxPriceValue = queryString(request.query.maxPrice);
  const minRatingValue = queryString(request.query.minRating);
  const minPrice =
    minPriceValue === undefined ? undefined : Number(minPriceValue);
  const maxPrice =
    maxPriceValue === undefined ? undefined : Number(maxPriceValue);
  const minRating =
    minRatingValue === undefined ? undefined : Number(minRatingValue);
  const status = queryString(request.query.status);
  const sortValue = queryString(request.query.sort);

  if (
    (minPrice !== undefined && (!Number.isFinite(minPrice) || minPrice < 0)) ||
    (maxPrice !== undefined && (!Number.isFinite(maxPrice) || maxPrice < 0)) ||
    (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) ||
    (minRating !== undefined &&
      (!Number.isFinite(minRating) || minRating < 0 || minRating > 5)) ||
    (status !== undefined &&
      !["IN_STOCK", "OUT_OF_STOCK", "UPCOMING", "COMING_SOON"].includes(
        status,
      )) ||
    (sortValue !== undefined &&
      !["newest", "price_asc", "price_desc"].includes(sortValue))
  ) {
    errorResponse(response, 400, "Invalid product filters");
    return;
  }

  let variantOptions: Record<string, string[]> | undefined;
  const rawVariantOptions = queryString(request.query.variantOptions);
  if (rawVariantOptions) {
    try {
      const parsed: unknown = JSON.parse(rawVariantOptions);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed) ||
        Object.entries(parsed).some(
          ([name, values]) =>
            !name.trim() ||
            !Array.isArray(values) ||
            values.some((value) => typeof value !== "string" || !value.trim()),
        )
      ) {
        throw new Error("Invalid variant options");
      }
      variantOptions = parsed as Record<string, string[]>;
    } catch {
      errorResponse(
        response,
        400,
        "variantOptions must be a JSON object of option names to values",
      );
      return;
    }
  }

  const data = await listProducts({
    page,
    limit,
    ...(minPrice === undefined ? {} : { minPrice }),
    ...(maxPrice === undefined ? {} : { maxPrice }),
    ...(minRating === undefined ? {} : { minRating }),
    ...(queryList(request.query.categoryIds).length
      ? { categoryIds: queryList(request.query.categoryIds) }
      : queryString(request.query.categoryId)
        ? { categoryIds: [queryString(request.query.categoryId)!] }
        : {}),
    ...(queryList(request.query.subcategoryIds).length
      ? { subcategoryIds: queryList(request.query.subcategoryIds) }
      : queryString(request.query.subcategoryId)
        ? { subcategoryIds: [queryString(request.query.subcategoryId)!] }
        : {}),
    ...(variantOptions ? { variantOptions } : {}),
    ...(status ? { status } : {}),
    ...(queryList(request.query.collections).length
      ? { collections: queryList(request.query.collections) }
      : {}),
    ...(sortValue
      ? { sort: sortValue as "newest" | "price_asc" | "price_desc" }
      : {}),
  });

  successResponse(response, "products loaded", data);
};

export const getProductController: RequestHandler = async (
  request,
  response,
) => {
  const identifier = request.params.id;
  if (typeof identifier !== "string") {
    errorResponse(response, 400, "A valid product id or slug is required");
    return;
  }

  successResponse(
    response,
    "Product loaded",
    await getProductByIdOrSlug(identifier),
  );
};

export const productController = {
  ...crudController,
  list: listProductsController,
  getById: getProductController,
};
