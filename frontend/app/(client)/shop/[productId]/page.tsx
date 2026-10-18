"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, Minus, Play, Plus, ShoppingBag, Star } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct, useProducts } from "@/hooks";
import { toProductCard } from "@/lib/product-view";
import { useCartStore } from "@/lib/cart-store";

const formatPrice = (price: string) =>
  `৳${Number(price).toLocaleString("en-BD")}`;

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailContent />
    </Suspense>
  );
}

function ProductDetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading product"
      className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8"
    >
      <Skeleton className="mb-8 h-4 w-20 rounded-none" />
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <Skeleton className="aspect-4/5 w-full rounded-none" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="size-16 rounded-none sm:size-20" />
            <Skeleton className="size-16 rounded-none sm:size-20" />
            <Skeleton className="size-16 rounded-none sm:size-20" />
          </div>
        </div>
        <section className="flex flex-col py-2">
          <Skeleton className="h-3 w-24 rounded-none" />
          <Skeleton className="mt-3 h-9 w-4/5 rounded-none" />
          <Skeleton className="mt-4 h-4 w-20 rounded-none" />
          <Skeleton className="mt-6 h-6 w-28 rounded-none" />
          <div className="mt-6 space-y-2">
            <Skeleton className="h-3 w-full rounded-none" />
            <Skeleton className="h-3 w-11/12 rounded-none" />
            <Skeleton className="h-3 w-3/4 rounded-none" />
          </div>
          <div className="mt-8 border-y border-gray-200 py-6">
            <Skeleton className="h-4 w-32 rounded-none" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-10 w-20 rounded-none" />
              <Skeleton className="h-10 w-20 rounded-none" />
              <Skeleton className="h-10 w-20 rounded-none" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-11 w-28 rounded-none" />
            <Skeleton className="h-11 flex-1 rounded-none" />
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductDetailContent() {
  const params = useParams<{ productId: string }>();
  const productQuery = useProduct(params.productId);
  const categorySlug = productQuery.data?.categories?.[0]?.category.slug;
  const relatedQuery = useProducts({
    page: 1,
    limit: 100,
    ...(categorySlug ? { categorySlugs: [categorySlug] } : {}),
  });
  const addItem = useCartStore((state) => state.addItem);
  const [selectedVariantId, setSelectedVariantId] = useState<string>();
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (productQuery.isPending) {
    return <ProductDetailSkeleton />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <main className="mx-auto w-full max-w-7xl px-5 py-20">
        <p className="text-sm text-gray-600">
          This product could not be found.
        </p>
        <Link
          href="/shop"
          className="mt-4 inline-flex items-center gap-2 text-sm underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
      </main>
    );
  }

  const product = productQuery.data;
  const relatedProducts = (relatedQuery.data?.items ?? [])
    .filter((candidate) => candidate.id !== product.id)
    .map((candidate) => ({
      product: candidate,
      rank: hash(`${product.id}:${candidate.id}`),
    }))
    .sort((left, right) => left.rank - right.rank)
    .slice(0, 4)
    .map(({ product: candidate }) => toProductCard(candidate));
  const variants = product.variants ?? [];
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];
  const variantMedia = selectedVariant?.images ?? [];
  const galleryMedia =
    variantMedia.length > 0
      ? variantMedia
      : product.baseImage
        ? [product.baseImage]
        : [];
  const mainMedia = galleryMedia.includes(selectedMediaUrl ?? "")
    ? selectedMediaUrl!
    : galleryMedia[0];
  const cartImage =
    galleryMedia.find((media) => !isVideoUrl(media)) ?? product.baseImage;
  const category = product.categories?.[0]?.category.name ?? "Collection";
  const optionsText = selectedVariant?.options
    .map((option) => `${option.name}: ${option.value}`)
    .join(" · ");
  const canAddToCart =
    product.status === "IN_STOCK" && Boolean(selectedVariant);

  function handleAddToCart() {
    if (!selectedVariant || !canAddToCart) return;

    addItem(
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        image: cartImage ?? null,
        variantId: selectedVariant.id,
        sku: selectedVariant.sku,
        unitPrice: selectedVariant.price,
        options: selectedVariant.options,
      },
      quantity,
    );
    setAdded(true);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-2 text-xs text-gray-500 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" /> Shop all
      </Link>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <div className="relative aspect-4/5 overflow-hidden bg-gray-100">
            {mainMedia ? (
              isVideoUrl(mainMedia) ? (
                <video
                  key={mainMedia}
                  src={mainMedia}
                  controls
                  playsInline
                  className="absolute inset-0 h-full w-full bg-black object-contain"
                />
              ) : (
                <Image
                  src={mainMedia}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <ShoppingBag className="h-12 w-12" />
              </div>
            )}
            {product.status !== "IN_STOCK" && (
              <span className="absolute left-4 top-4 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-wider">
                {product.status.replaceAll("_", " ")}
              </span>
            )}
          </div>
          {galleryMedia.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {galleryMedia.map((media, index) => {
                const isVideo = isVideoUrl(media);
                const selected = media === mainMedia;
                return (
                  <button
                    key={`${media}-${index}`}
                    type="button"
                    aria-label={`View product ${isVideo ? "video" : "image"} ${index + 1}`}
                    aria-pressed={selected}
                    onClick={() => setSelectedMediaUrl(media)}
                    className={`relative aspect-square w-16 overflow-hidden border bg-gray-100 sm:w-20 ${selected ? "border-gray-950" : "border-gray-200"}`}
                  >
                    {isVideo ? (
                      <>
                        <video
                          src={media}
                          muted
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/20 text-white">
                          <Play className="h-5 w-5 fill-current" />
                        </span>
                      </>
                    ) : (
                      <Image
                        src={media}
                        alt={`${product.name} image ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <section className="flex flex-col py-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-gray-500">
            {category}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-gray-950">
            {product.name}
          </h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>
              {product.averageRating > 0
                ? product.averageRating.toFixed(1)
                : "New"}
            </span>
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-950">
            {selectedVariant
              ? formatPrice(selectedVariant.price)
              : "Price unavailable"}
            {selectedVariant?.compareAtPrice && (
              <span className="ml-3 text-sm font-normal text-gray-400 line-through">
                {formatPrice(selectedVariant.compareAtPrice)}
              </span>
            )}
          </p>
          {product.description && (
            <p className="mt-6 max-w-xl whitespace-pre-wrap text-sm leading-7 text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-8 border-y border-gray-200 py-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Choose an option
              </h2>
              <span className="text-[11px] text-gray-400">
                SKU {selectedVariant?.sku ?? "—"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {variants.map((variant) => {
                const selected = variant.id === selectedVariant?.id;
                const label =
                  variant.options.map((option) => option.value).join(" / ") ||
                  variant.sku;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedVariantId(variant.id);
                      setSelectedMediaUrl(undefined);
                      setAdded(false);
                    }}
                    className={`min-h-10 border px-3 text-xs transition ${selected ? "border-black bg-black text-white" : "border-gray-200 text-gray-700 hover:border-black"}`}
                  >
                    <span className="block">{label}</span>
                    <span className="mt-1 block text-[10px] opacity-70">
                      {formatPrice(variant.price)}
                    </span>
                  </button>
                );
              })}
              {variants.length === 0 && (
                <span className="text-xs text-gray-500">
                  No product options available.
                </span>
              )}
            </div>
            {optionsText && (
              <p className="mt-3 text-[11px] text-gray-500">
                Selected: {optionsText}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex h-11 items-center border border-gray-200">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid h-10 w-10 place-items-center text-gray-600 hover:text-black"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((value) => Math.min(100, value + 1))}
                className="grid h-10 w-10 place-items-center text-gray-600 hover:text-black"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              className="flex h-11 flex-1 items-center justify-center gap-2 bg-gray-950 px-6 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <ShoppingBag className="h-4 w-4" />
              {added
                ? "Added to cart"
                : canAddToCart
                  ? "Add to cart"
                  : "Unavailable"}
            </button>
          </div>
          {added && (
            <Link
              href="/cart"
              className="mt-3 text-xs text-gray-600 underline underline-offset-4"
            >
              View your cart
            </Link>
          )}
        </section>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-10 sm:mt-20">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-emerald-800">
                {category}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-gray-950">
                More from this category
              </h2>
            </div>
            <Link
              href={`/shop?categories=${encodeURIComponent(categorySlug ?? "")}`}
              className="shrink-0 text-xs font-medium text-gray-600 underline underline-offset-4 hover:text-black"
            >
              View category
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function hash(value: string) {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function isVideoUrl(url: string) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return (
      path.includes("/video/upload/") || /\.(mp4|mov|webm|m4v)$/.test(path)
    );
  } catch {
    return false;
  }
}
