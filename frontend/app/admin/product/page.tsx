"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowDownToLine,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  ServerDataTable,
  type ServerDataTableColumn,
} from "@/components/data-table";
import {
  ProductFormDialog,
  type ProductFormValues,
} from "@/components/admin/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminProductMutations,
  useAdminProducts,
} from "@/hooks/use-resources";
import {
  categoriesApi,
  adminProductsApi,
  subcategoriesApi,
} from "@/server/resources";
import type {
  AdminProduct,
  AdminProductInput,
  Category,
  ListParams,
  PaginatedData,
  SubCategory,
} from "@/server/types";

async function fetchAllPages<T>(
  list: (params?: ListParams) => Promise<PaginatedData<T>>,
) {
  const firstPage = await list({ page: 1, limit: 100 });
  if (firstPage.pagination.pages <= 1) return firstPage.items;
  const otherPages = await Promise.all(
    Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
      list({ page: index + 2, limit: 100 }),
    ),
  );
  return firstPage.items.concat(...otherPages.map((result) => result.items));
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function productPayload(values: ProductFormValues): AdminProductInput {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    sku: values.sku.trim() || null,
    baseImage: values.baseImage || null,
    description: values.description.trim() || null,
    isActive: values.isActive,
    isNew: values.isNew,
    isBestSeller: values.isBestSeller,
    isFeatured: values.isFeatured,
    status: values.status,
    categoryIds: values.categoryIds,
    subcategoryIds: values.subcategoryIds,
    variants: values.variants.map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      sku: variant.sku.trim(),
      price: variant.price.trim(),
      compareAtPrice: variant.compareAtPrice.trim() || null,
      images: variant.images,
      options: variant.options.map((option) => ({
        name: option.name.trim(),
        value: option.value.trim(),
        image: option.image.trim(),
      })),
      isActive: variant.isActive,
    })),
  };
}

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [exporting, setExporting] = useState(false);

  const productsQuery = useAdminProducts({ page, limit });
  const categoriesQuery = useQuery({
    queryKey: ["categories", "product-form-options"],
    queryFn: () => fetchAllPages<Category>(categoriesApi.list),
  });
  const subcategoriesQuery = useQuery({
    queryKey: ["subcategories", "product-form-options"],
    queryFn: () => fetchAllPages<SubCategory>(subcategoriesApi.list),
  });
  const categories = categoriesQuery.data ?? [];
  const subcategories = subcategoriesQuery.data ?? [];
  const lookupsLoading =
    categoriesQuery.isLoading || subcategoriesQuery.isLoading;
  const lookupError =
    categoriesQuery.error || subcategoriesQuery.error
      ? getErrorMessage(categoriesQuery.error ?? subcategoriesQuery.error)
      : null;
  const mutations = useAdminProductMutations();
  const products = productsQuery.data?.items ?? [];
  const pagination = {
    page,
    limit,
    total: productsQuery.data?.pagination.total ?? 0,
    pages: productsQuery.data?.pagination.pages ?? 0,
  };

  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const subcategoryNameById = new Map(
    subcategories.map((subcategory) => [subcategory.id, subcategory.name]),
  );

  const columns: ServerDataTableColumn<AdminProduct>[] = [
    {
      id: "product",
      header: "Product",
      cell: (product) => (
        <div className="min-w-40">
          <Link
            href={`/admin/product/${encodeURIComponent(product.id)}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {product.name}
          </Link>
          <p className="text-xs text-muted-foreground">{product.slug}</p>
          {product.sku && (
            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
          )}
        </div>
      ),
    },
    {
      id: "variants",
      header: "Variants / From",
      cell: (product) => {
        const activeVariants = product.variants.filter(
          (variant) => variant.isActive,
        );
        const minimumPrice = activeVariants.reduce<number | null>(
          (minimum, variant) => {
            const price = Number(variant.price);
            return Number.isFinite(price) &&
              (minimum === null || price < minimum)
              ? price
              : minimum;
          },
          null,
        );
        return (
          <div>
            <p>{activeVariants.length} active</p>
            <p className="text-xs text-muted-foreground">
              {minimumPrice === null
                ? "No active price"
                : minimumPrice.toFixed(2)}
            </p>
          </div>
        );
      },
    },
    {
      id: "categories",
      header: "Categories",
      cell: (product) => {
        const labels = [
          ...product.categories.map(({ categoryId }) =>
            categoryNameById.get(categoryId),
          ),
          ...product.subCategories.map(({ subCategoryId }) =>
            subcategoryNameById.get(subCategoryId),
          ),
        ].filter((label): label is string => Boolean(label));
        return (
          <span
            className="block max-w-48 truncate text-muted-foreground"
            title={labels.join(", ")}
          >
            {labels.length ? labels.join(", ") : "-"}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: (product) => (
        <div className="grid justify-items-start gap-1">
          <Badge
            variant={product.status === "IN_STOCK" ? "secondary" : "outline"}
          >
            {product.status.replaceAll("_", " ")}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {product.isActive ? "Active" : "Hidden"}
          </span>
        </div>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      cell: (product) => formatDate(product.updatedAt),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-28 text-right",
      cell: (product) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View ${product.name}`}
            render={
              <Link href={`/admin/product/${encodeURIComponent(product.id)}`} />
            }
          >
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${product.name}`}
            onClick={() => {
              setEditingProduct(product);
              setFormOpen(true);
            }}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${product.name}`}
            onClick={() => setDeleteTarget(product)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  async function saveProduct(values: ProductFormValues) {
    const payload = productPayload(values);
    try {
      if (editingProduct) {
        await mutations.update.mutateAsync({
          id: editingProduct.id,
          data: payload,
        });
        toast.success("Product updated");
      } else {
        await mutations.create.mutateAsync(payload);
        setPage(1);
        toast.success("Product created");
      }
      setFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function deleteProduct() {
    if (!deleteTarget) return;
    try {
      await mutations.remove.mutateAsync(deleteTarget.id);
      if (products.length === 1 && page > 1)
        setPage((currentPage) => currentPage - 1);
      setDeleteTarget(null);
      toast.success("Product deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function exportProducts() {
    setExporting(true);
    try {
      const [XLSX, allProducts] = await Promise.all([
        import("xlsx"),
        fetchAllPages(adminProductsApi.list),
      ]);
      const worksheet = XLSX.utils.json_to_sheet(
        allProducts.map((product) => ({
          ID: product.id,
          Name: product.name,
          Slug: product.slug,
          SKU: product.sku ?? "",
          Description: product.description ?? "",
          "Base Media": product.baseImage ?? "",
          Status: product.status,
          Active: product.isActive,
          New: product.isNew,
          "Best Seller": product.isBestSeller,
          Featured: product.isFeatured,
          Categories: product.categories
            .map(
              ({ categoryId }) =>
                categoryNameById.get(categoryId) ?? categoryId,
            )
            .join(", "),
          Subcategories: product.subCategories
            .map(
              ({ subCategoryId }) =>
                subcategoryNameById.get(subCategoryId) ?? subCategoryId,
            )
            .join(", "),
          Variants: JSON.stringify(
            product.variants.map((variant) => ({
              sku: variant.sku,
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              isActive: variant.isActive,
              images: variant.images,
              options: variant.options,
            })),
          ),
          "Average Rating": product.averageRating,
          "Created At": product.createdAt,
          "Updated At": product.updatedAt,
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, "products.xlsx");
      toast.success("Products exported to Excel");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage product content, variants, catalog visibility, and media.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportProducts}
            disabled={exporting}
          >
            {exporting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <ArrowDownToLine />
            )}
            Export Excel
          </Button>
          <Button
            onClick={() => {
              setEditingProduct(null);
              setFormOpen(true);
            }}
            disabled={lookupsLoading || Boolean(lookupError)}
          >
            <Plus />
            Add product
          </Button>
        </div>
      </header>

      <div>
        <h2 className="font-medium">Catalog</h2>
        <p className="text-sm text-muted-foreground">
          {pagination.total} total products
        </p>
      </div>

      {productsQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(productsQuery.error)}
        </p>
      )}
      {lookupError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load category options: {lookupError}
        </p>
      )}

      <ServerDataTable
        data={products}
        columns={columns}
        pagination={pagination}
        loading={productsQuery.isLoading}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        emptyMessage="No products found."
      />

      <ProductFormDialog
        open={formOpen}
        product={editingProduct}
        categories={categories}
        subcategories={subcategories}
        lookupsLoading={lookupsLoading}
        saving={mutations.create.isPending || mutations.update.isPending}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProduct(null);
        }}
        onSave={saveProduct}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              “{deleteTarget?.name}” will be permanently deleted if it has no
              order history. Products referenced by existing orders cannot be
              removed from the database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutations.remove.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={deleteProduct}
              disabled={mutations.remove.isPending}
            >
              {mutations.remove.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              Delete product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
