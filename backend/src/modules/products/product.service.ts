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

const adminProductInclude = {
  variants: { orderBy: { createdAt: "asc" as const } },
  categories: {
    include: { category: { select: { id: true, name: true, slug: true } } },
  },
  subCategories: {
    include: {
      subCategory: { select: { id: true, name: true, slug: true } },
    },
  },
} satisfies Prisma.ProductInclude;

export type AdminProductVariantInput = {
  id?: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  images: string[];
  options: Array<{ name: string; value: string; image?: string }>;
  isActive: boolean;
};

export type AdminProductInput = {
  name: string;
  slug: string;
  sku: string | null;
  baseImage: string | null;
  description: string | null;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  status: ProductStatus;
  categoryIds: string[];
  subcategoryIds: string[];
  variants: AdminProductVariantInput[];
};

export async function listAdminProducts(page: number, limit: number) {
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: adminProductInclude,
    }),
    prisma.product.count(),
  ]);

  return {
    items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export function getAdminProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: adminProductInclude,
  });
}

function productData(input: AdminProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    baseImage: input.baseImage,
    description: input.description,
    isActive: input.isActive,
    isNew: input.isNew,
    isBestSeller: input.isBestSeller,
    isFeatured: input.isFeatured,
    status: input.status,
  };
}

function variantData(variant: AdminProductVariantInput) {
  return {
    sku: variant.sku,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    images: variant.images,
    options: variant.options as Prisma.InputJsonValue,
    isActive: variant.isActive,
  };
}

async function validateProductRelations(
  transaction: Prisma.TransactionClient,
  input: AdminProductInput,
) {
  const [categories, subcategories] = await Promise.all([
    transaction.category.count({ where: { id: { in: input.categoryIds } } }),
    transaction.subCategory.findMany({
      where: { id: { in: input.subcategoryIds } },
      select: { id: true, categoryId: true },
    }),
  ]);
  if (categories !== input.categoryIds.length) {
    throw Object.assign(
      new Error("One or more selected categories do not exist"),
      {
        status: 400,
      },
    );
  }
  if (
    subcategories.length !== input.subcategoryIds.length ||
    subcategories.some(
      ({ categoryId }) => !input.categoryIds.includes(categoryId),
    )
  ) {
    throw Object.assign(
      new Error("Selected subcategories must belong to selected categories"),
      { status: 400 },
    );
  }
}

export async function createAdminProduct(input: AdminProductInput) {
  return prisma.$transaction(async (transaction) => {
    await validateProductRelations(transaction, input);
    return transaction.product.create({
      data: {
        ...productData(input),
        categories: {
          create: input.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        subCategories: {
          create: input.subcategoryIds.map((subCategoryId) => ({
            subCategory: { connect: { id: subCategoryId } },
          })),
        },
        variants: { create: input.variants.map(variantData) },
      },
      include: adminProductInclude,
    });
  });
}

export async function updateAdminProduct(id: string, input: AdminProductInput) {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw Object.assign(new Error("Product not found"), { status: 404 });
    }

    await validateProductRelations(transaction, input);
    const existingVariants = await transaction.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const existingVariantIds = new Set(existingVariants.map(({ id }) => id));
    const requestedVariantIds = input.variants.flatMap((variant) =>
      variant.id ? [variant.id] : [],
    );
    if (
      requestedVariantIds.some(
        (variantId) => !existingVariantIds.has(variantId),
      ) ||
      new Set(requestedVariantIds).size !== requestedVariantIds.length
    ) {
      throw Object.assign(new Error("Invalid product variant reference"), {
        status: 400,
      });
    }

    const requestedIds = new Set(requestedVariantIds);
    const removedIds = existingVariants
      .map(({ id: variantId }) => variantId)
      .filter((variantId) => !requestedIds.has(variantId));
    if (removedIds.length) {
      const referencedVariants = await transaction.orderItem.findMany({
        where: { variantId: { in: removedIds } },
        select: { variantId: true },
        distinct: ["variantId"],
      });
      const referencedIds = new Set(
        referencedVariants.map(({ variantId }) => variantId),
      );
      const deactivateIds = removedIds.filter((variantId) =>
        referencedIds.has(variantId),
      );
      const deleteIds = removedIds.filter(
        (variantId) => !referencedIds.has(variantId),
      );
      if (deactivateIds.length) {
        await transaction.productVariant.updateMany({
          where: { id: { in: deactivateIds } },
          data: { isActive: false },
        });
      }
      if (deleteIds.length) {
        await transaction.productVariant.deleteMany({
          where: { id: { in: deleteIds } },
        });
      }
    }

    for (const variant of input.variants) {
      if (variant.id) {
        await transaction.productVariant.update({
          where: { id: variant.id },
          data: variantData(variant),
        });
      } else {
        await transaction.productVariant.create({
          data: { ...variantData(variant), productId: id },
        });
      }
    }

    await transaction.productCategory.deleteMany({ where: { productId: id } });
    await transaction.productSubCategory.deleteMany({
      where: { productId: id },
    });
    await transaction.product.update({
      where: { id },
      data: {
        ...productData(input),
        categories: {
          create: input.categoryIds.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
        subCategories: {
          create: input.subcategoryIds.map((subCategoryId) => ({
            subCategory: { connect: { id: subCategoryId } },
          })),
        },
      },
      include: adminProductInclude,
    });

    return transaction.product.findUniqueOrThrow({
      where: { id },
      include: adminProductInclude,
    });
  });
}

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
