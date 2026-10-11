import type { RequestHandler } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import { createCrudController } from "../crud/crud.controller.js";
import {
  createAdminProduct,
  getAdminProductById,
  getProductByIdOrSlug,
  listAdminProducts,
  listProducts,
  productService,
  updateAdminProduct,
  type AdminProductInput,
  type AdminProductVariantInput,
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

const productStatuses = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "UPCOMING",
  "COMING_SOON",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function parseAdminProductInput(
  value: unknown,
):
  { data: AdminProductInput; error?: never } | { data?: never; error: string } {
  if (!isRecord(value)) {
    return { error: "A product object is required" };
  }

  const name = typeof value.name === "string" ? value.name.trim() : "";
  const slug = typeof value.slug === "string" ? value.slug.trim() : "";
  if (!name || name.length > 120) {
    return {
      error: "Product name is required and must be under 120 characters",
    };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) {
    return { error: "Slug must use lowercase letters, numbers, and hyphens" };
  }

  const sku = value.sku === null || value.sku === "" ? null : value.sku;
  if (sku !== null && (typeof sku !== "string" || sku.trim().length > 80)) {
    return { error: "SKU must be a string under 80 characters" };
  }

  const baseImage = value.baseImage === "" ? null : value.baseImage;
  if (
    baseImage !== null &&
    (typeof baseImage !== "string" || !isHttpUrl(baseImage))
  ) {
    return { error: "Base media must be a valid URL" };
  }
  const description = value.description === "" ? null : value.description;
  if (
    description !== null &&
    (typeof description !== "string" || description.length > 10000)
  ) {
    return { error: "Description must be under 10000 characters" };
  }

  if (
    !productStatuses.includes(value.status as (typeof productStatuses)[number])
  ) {
    return { error: "Invalid product status" };
  }
  for (const key of [
    "isActive",
    "isNew",
    "isBestSeller",
    "isFeatured",
  ] as const) {
    if (typeof value[key] !== "boolean") {
      return { error: `${key} must be a boolean` };
    }
  }

  const categoryIds = value.categoryIds;
  const subcategoryIds = value.subcategoryIds;
  if (
    !Array.isArray(categoryIds) ||
    categoryIds.some((id) => typeof id !== "string" || !id) ||
    !Array.isArray(subcategoryIds) ||
    subcategoryIds.some((id) => typeof id !== "string" || !id)
  ) {
    return { error: "Category selections are invalid" };
  }
  if (
    new Set(categoryIds).size !== categoryIds.length ||
    new Set(subcategoryIds).size !== subcategoryIds.length
  ) {
    return { error: "Duplicate category selections are not allowed" };
  }

  if (
    !Array.isArray(value.variants) ||
    value.variants.length === 0 ||
    value.variants.length > 100
  ) {
    return { error: "Add between 1 and 100 product variants" };
  }
  const variants: AdminProductVariantInput[] = [];
  const variantSkus = new Set<string>();
  for (const item of value.variants) {
    if (!isRecord(item)) return { error: "Variant data is invalid" };
    const variantSku = typeof item.sku === "string" ? item.sku.trim() : "";
    const price = typeof item.price === "string" ? item.price.trim() : "";
    const compareAtPrice = item.compareAtPrice;
    const moneyPattern = /^\d{1,10}(?:\.\d{1,2})?$/;
    if (!variantSku || variantSku.length > 80 || variantSkus.has(variantSku)) {
      return { error: "Each variant needs a unique SKU under 80 characters" };
    }
    if (!moneyPattern.test(price)) {
      return {
        error:
          "Variant price must be a non-negative amount with up to 2 decimals",
      };
    }
    if (
      compareAtPrice !== null &&
      (typeof compareAtPrice !== "string" ||
        !moneyPattern.test(compareAtPrice) ||
        Number(compareAtPrice) < Number(price))
    ) {
      return {
        error: "Compare-at price must be blank or at least the variant price",
      };
    }
    if (
      !Array.isArray(item.images) ||
      item.images.some(
        (image) => typeof image !== "string" || !isHttpUrl(image),
      ) ||
      !Array.isArray(item.options) ||
      typeof item.isActive !== "boolean"
    ) {
      return { error: "Variant media, options, or active state is invalid" };
    }
    const options: AdminProductVariantInput["options"] = [];
    for (const option of item.options) {
      if (
        !isRecord(option) ||
        typeof option.name !== "string" ||
        !option.name.trim() ||
        typeof option.value !== "string" ||
        !option.value.trim() ||
        (option.image !== undefined && typeof option.image !== "string")
      ) {
        return {
          error: "Each option needs a name, value, and valid image URL",
        };
      }
      const image = typeof option.image === "string" ? option.image.trim() : "";
      if (image && !isHttpUrl(image)) {
        return { error: "Option image must be a valid URL" };
      }
      options.push({
        name: option.name.trim(),
        value: option.value.trim(),
        image,
      });
    }
    if (item.id !== undefined && (typeof item.id !== "string" || !item.id)) {
      return { error: "Variant id is invalid" };
    }
    variantSkus.add(variantSku);
    variants.push({
      ...(typeof item.id === "string" ? { id: item.id } : {}),
      sku: variantSku,
      price,
      compareAtPrice:
        typeof compareAtPrice === "string" ? compareAtPrice : null,
      images: item.images as string[],
      options,
      isActive: item.isActive,
    });
  }

  return {
    data: {
      name,
      slug,
      sku: typeof sku === "string" ? sku.trim() || null : null,
      baseImage: typeof baseImage === "string" ? baseImage : null,
      description:
        typeof description === "string" ? description.trim() || null : null,
      isActive: value.isActive as boolean,
      isNew: value.isNew as boolean,
      isBestSeller: value.isBestSeller as boolean,
      isFeatured: value.isFeatured as boolean,
      status: value.status as AdminProductInput["status"],
      categoryIds: categoryIds as string[],
      subcategoryIds: subcategoryIds as string[],
      variants,
    },
  };
}

export const listAdminProductsController: RequestHandler = async (
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
  successResponse(
    response,
    "Admin products loaded",
    await listAdminProducts(page, limit),
  );
};

export const getAdminProductController: RequestHandler = async (
  request,
  response,
) => {
  const id = request.params.id;
  if (typeof id !== "string") {
    errorResponse(response, 400, "A valid product id is required");
    return;
  }
  const product = await getAdminProductById(id);
  if (!product) {
    errorResponse(response, 404, "Product not found");
    return;
  }
  successResponse(response, "Admin product details", product);
};

export const createAdminProductController: RequestHandler = async (
  request,
  response,
) => {
  const parsed = parseAdminProductInput(request.body);
  if (parsed.error) {
    errorResponse(response, 400, parsed.error);
    return;
  }
  successResponse(
    response,
    "Product created",
    await createAdminProduct(parsed.data!),
    201,
  );
};

export const updateAdminProductController: RequestHandler = async (
  request,
  response,
) => {
  const id = request.params.id;
  if (typeof id !== "string") {
    errorResponse(response, 400, "A valid product id is required");
    return;
  }
  const parsed = parseAdminProductInput(request.body);
  if (parsed.error) {
    errorResponse(response, 400, parsed.error);
    return;
  }
  successResponse(
    response,
    "Product updated",
    await updateAdminProduct(id, parsed.data!),
  );
};
