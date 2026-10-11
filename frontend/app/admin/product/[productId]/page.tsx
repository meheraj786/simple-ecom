"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, LoaderCircle, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminProduct } from "@/hooks/use-resources";
import type { AdminProduct } from "@/server/types";

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
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      }).format(date);
}

function formatAmount(value: string | null) {
  if (value === null) return "-";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : value;
}

function isVideo(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      path.includes("/video/upload/") || /\.(mp4|mov|webm|m4v)$/.test(path)
    );
  } catch {
    return false;
  }
}

function MediaTile({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group relative block aspect-square w-full overflow-hidden rounded-md border bg-muted"
      aria-label={`Open ${label}`}
    >
      {isVideo(url) ? (
        <video src={url} controls className="size-full object-contain" />
      ) : (
        <Image
          src={url}
          alt={label}
          fill
          sizes="(max-width: 640px) 40vw, 180px"
          unoptimized
          className="object-contain"
        />
      )}
    </a>
  );
}

function ProductDetails({ product }: { product: AdminProduct }) {
  const categoryNames = product.categories.map(({ category }) => category.name);
  const subcategoryNames = product.subCategories.map(
    ({ subCategory }) => subCategory.name,
  );

  return (
    <>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            render={<Link href="/admin/product" />}
          >
            <ArrowLeft />
            Products
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {product.name}
            </h1>
            <Badge variant={product.isActive ? "secondary" : "outline"}>
              {product.isActive ? "Active" : "Hidden"}
            </Badge>
            <Badge variant="outline">
              {product.status.replaceAll("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">/{product.slug}</p>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="grid gap-4 rounded-lg border p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-medium">Product information</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                ID: {product.id}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-sm font-medium">
              <Star className="size-4 fill-amber-400 text-amber-500" />
              {product.averageRating.toFixed(1)} average rating
            </div>
          </div>
          {product.baseImage && (
            <div className="max-w-sm">
              <MediaTile
                url={product.baseImage}
                label={`${product.name} media`}
              />
            </div>
          )}
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <div className="grid min-w-0 gap-1">
              <dt className="text-xs text-muted-foreground">Product SKU</dt>
              <dd className="text-sm">{product.sku || "-"}</dd>
            </div>
            <div className="grid min-w-0 gap-1">
              <dt className="text-xs text-muted-foreground">
                Inventory status
              </dt>
              <dd className="text-sm">{product.status.replaceAll("_", " ")}</dd>
            </div>
            <div className="grid min-w-0 gap-1 sm:col-span-2">
              <dt className="text-xs text-muted-foreground">Description</dt>
              <dd className="whitespace-pre-wrap wrap-break-word text-sm leading-6">
                {product.description || "No description provided."}
              </dd>
            </div>
            <div className="grid min-w-0 gap-1">
              <dt className="text-xs text-muted-foreground">Categories</dt>
              <dd className="text-sm">{categoryNames.join(", ") || "-"}</dd>
            </div>
            <div className="grid min-w-0 gap-1">
              <dt className="text-xs text-muted-foreground">Subcategories</dt>
              <dd className="text-sm">{subcategoryNames.join(", ") || "-"}</dd>
            </div>
          </dl>
        </div>

        <aside className="grid content-start gap-4 rounded-lg border p-4 sm:p-5">
          <div>
            <h2 className="font-medium">Catalog flags</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Visibility and merchandising
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={product.isActive ? "secondary" : "outline"}>
              {product.isActive ? "Active" : "Inactive"}
            </Badge>
            {product.isNew && <Badge variant="outline">New arrival</Badge>}
            {product.isBestSeller && (
              <Badge variant="outline">Best seller</Badge>
            )}
            {product.isFeatured && <Badge variant="outline">Featured</Badge>}
          </div>
          <dl className="grid gap-4 border-t pt-4">
            <div className="grid gap-1">
              <dt className="text-xs text-muted-foreground">Created</dt>
              <dd className="text-sm">{formatDate(product.createdAt)}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs text-muted-foreground">Last updated</dt>
              <dd className="text-sm">{formatDate(product.updatedAt)}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="font-medium">Variants</h2>
          <p className="text-sm text-muted-foreground">
            {product.variants.length} total variants, including inactive
            variants retained for order history.
          </p>
        </div>
        {product.variants.map((variant) => (
          <article
            key={variant.id}
            className="grid gap-4 rounded-lg border p-4 sm:p-5"
          >
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">{variant.sku}</h3>
                <p className="text-xs text-muted-foreground">
                  Variant ID: {variant.id}
                </p>
              </div>
              <Badge variant={variant.isActive ? "secondary" : "outline"}>
                {variant.isActive ? "Active" : "Inactive"}
              </Badge>
            </header>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-1">
                <dt className="text-xs text-muted-foreground">Price</dt>
                <dd className="text-sm font-medium">
                  {formatAmount(variant.price)}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-xs text-muted-foreground">
                  Compare-at price
                </dt>
                <dd className="text-sm">
                  {formatAmount(variant.compareAtPrice)}
                </dd>
              </div>
              <div className="grid gap-1">
                <dt className="text-xs text-muted-foreground">Updated</dt>
                <dd className="text-sm">{formatDate(variant.updatedAt)}</dd>
              </div>
            </dl>

            <div className="grid gap-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                Options
              </h4>
              {variant.options.length ? (
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {variant.options.map((option, index) => (
                    <div
                      key={`${option.name}-${option.value}-${index}`}
                      className="flex min-w-0 items-center gap-3 rounded-md border p-2"
                    >
                      {option.image ? (
                        <div className="relative size-12 shrink-0 overflow-hidden rounded border bg-muted">
                          {isVideo(option.image) ? (
                            <video
                              src={option.image}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Image
                              src={option.image}
                              alt={`${option.name} ${option.value}`}
                              fill
                              sizes="48px"
                              unoptimized
                              className="object-cover"
                            />
                          )}
                        </div>
                      ) : null}
                      <p className="min-w-0 text-sm">
                        <span className="text-muted-foreground">
                          {option.name}:{" "}
                        </span>
                        <span className="font-medium">{option.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No options</p>
              )}
            </div>

            {variant.images.length > 0 && (
              <div className="grid gap-2">
                <h4 className="text-xs font-medium text-muted-foreground">
                  Variant media
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {variant.images.map((url, index) => (
                    <MediaTile
                      key={`${url}-${index}`}
                      url={url}
                      label={`${variant.sku} media ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
        {product.variants.length === 0 && (
          <div className="rounded-lg border py-14 text-center text-sm text-muted-foreground">
            No variants found.
          </div>
        )}
      </section>
    </>
  );
}

export default function AdminProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productQuery = useAdminProduct(params.productId);
  const product = productQuery.data;

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      {productQuery.isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Loading product
        </div>
      ) : productQuery.isError || !product ? (
        <div className="grid gap-4">
          <Button
            variant="ghost"
            className="w-fit"
            render={<Link href="/admin/product" />}
          >
            <ArrowLeft />
            Back to products
          </Button>
          <p role="alert" className="text-sm text-destructive">
            {productQuery.isError
              ? getErrorMessage(productQuery.error)
              : "Product not found"}
          </p>
        </div>
      ) : (
        <ProductDetails product={product} />
      )}
    </main>
  );
}
