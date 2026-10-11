import { prisma } from "../../db.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type { ProductStatus } from "../../generated/prisma/client.js";
import { createCrudService } from "../crud/crud.service.js";

export const productService = createCrudService("product", {
  path: "products",
  publicRead: true,
  publicWhere: { isActive: true },
  productStatus: true,
});

const productDetailInclude = {
  variants: {
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      images: true,
      options: true,
      isActive: true,
    },
  },
  categories: {
    include: {
      category: { select: { id: true, name: true, slug: true } },
    },
  },
  subCategories: {
    include: {
      subCategory: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.ProductInclude;

export async function getProductByIdOrSlug(identifier: string) {
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ id: identifier }, { slug: identifier }],
    },
    include: productDetailInclude,
  });

  if (!product) {
    throw Object.assign(new Error("Product not found"), { status: 404 });
  }

  return product;
}

export type ProductListFilters = {
  page: number;
  limit: number;
  minPrice?: number;
  maxPrice?: number;
  categoryIds?: string[];
  subcategoryIds?: string[];
  minRating?: number;
  variantOptions?: Record<string, string[]>;
  status?: string;
  collections?: string[];
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function listProducts(filters: ProductListFilters) {
  const optionGroups = Object.entries(filters.variantOptions ?? {}).filter(
    ([, values]) => values.length > 0,
  );
  const hasVariantFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    optionGroups.length > 0;

  const variantWhere: Prisma.ProductVariantWhereInput = {
    isActive: true,
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          price: {
            ...(filters.minPrice === undefined
              ? {}
              : { gte: filters.minPrice }),
            ...(filters.maxPrice === undefined
              ? {}
              : { lte: filters.maxPrice }),
          },
        }
      : {}),
    ...(optionGroups.length > 0
      ? {
          AND: optionGroups.map(([name, values]) => ({
            OR: values.map((value) => ({
              options: { array_contains: [{ name, value }] },
            })),
          })),
        }
      : {}),
  };

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(filters.status ? { status: filters.status as ProductStatus } : {}),
    ...(filters.minRating === undefined
      ? {}
      : { averageRating: { gte: filters.minRating } }),
    ...(filters.categoryIds?.length
      ? { categories: { some: { categoryId: { in: filters.categoryIds } } } }
      : {}),
    ...(filters.subcategoryIds?.length
      ? {
          subCategories: {
            some: { subCategoryId: { in: filters.subcategoryIds } },
          },
        }
      : {}),
    ...(filters.collections?.length
      ? {
          OR: filters.collections.map((collection) => {
            if (collection === "new-arrivals") return { isNew: true };
            if (collection === "best-sellers") return { isBestSeller: true };
            if (collection === "featured") return { isFeatured: true };
            return { id: "" };
          }),
        }
      : {}),
    ...(hasVariantFilters ? { variants: { some: variantWhere } } : {}),
  };

  const include: Prisma.ProductInclude = {
    ...productDetailInclude,
    variants: {
      ...productDetailInclude.variants,
      where: hasVariantFilters ? variantWhere : { isActive: true },
    },
  };

  let products;
  let total: number;

  if (filters.sort === "price_asc" || filters.sort === "price_desc") {
    const groupedVariants = await prisma.productVariant.groupBy({
      by: ["productId"],
      where: {
        ...variantWhere,
        product: where,
      },
      _min: { price: true },
    });
    groupedVariants.sort((left, right) => {
      const leftPrice = left._min.price?.toNumber() ?? 0;
      const rightPrice = right._min.price?.toNumber() ?? 0;
      const difference = leftPrice - rightPrice;
      return filters.sort === "price_asc" ? difference : -difference;
    });

    const productIds = groupedVariants
      .slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
      .map(({ productId }) => productId);
    const pageProducts = productIds.length
      ? await prisma.product.findMany({
          where: { id: { in: productIds } },
          include,
        })
      : [];
    const productOrder = new Map(productIds.map((id, index) => [id, index]));
    products = pageProducts.sort(
      (left, right) =>
        (productOrder.get(left.id) ?? 0) - (productOrder.get(right.id) ?? 0),
    );
    total = groupedVariants.length;
  } else {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: "desc" },
        include,
      }),
      prisma.product.count({ where }),
    ]);
  }

  return {
    items: products,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      pages: Math.ceil(total / filters.limit),
    },
  };
}
