import { Star, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export interface Product {
  id: string;
  slug?: string;
  name: string;
  category: string;
  price: number | string;
  originalPrice?: string;
  image?: string | null;
  discountBadge?: string;
  tagBadge?: string;
  isFeatured?: boolean;
  rating?: number;
  collections?: string[];
  displayPrice?: string;
  optionsText?: string;
  inStock?: boolean;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "UPCOMING" | "COMING_SOON";
  sizes?: string[];
  colors?: string[];
}

export function ProductCard({ product }: { product: Product }) {
  const stockStatus =
    product.stockStatus ??
    (product.inStock === false ? "OUT_OF_STOCK" : "IN_STOCK");
  const unavailable = stockStatus !== "IN_STOCK";
  const stockLabel =
    stockStatus === "UPCOMING"
      ? "UPCOMING"
      : stockStatus === "COMING_SOON"
        ? "COMING SOON"
        : "OUT OF STOCK";

  return (
    <article className="group flex min-w-0 flex-col bg-white">
      <ProductCardLink
        slug={product.slug}
        aria-label={`View ${product.name}`}
        className="relative block aspect-3/4 w-full overflow-hidden border border-gray-100 bg-gray-50"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-cover object-center transition-transform duration-500 ${
              unavailable ? "grayscale opacity-70" : "group-hover:scale-105"
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400">
            <ShoppingBag className="h-8 w-8" aria-hidden="true" />
          </div>
        )}

        {unavailable && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
            <span className="text-[10px] font-bold tracking-wider text-gray-800 bg-white/90 px-3 py-1 rounded-full border border-gray-200">
              {stockLabel}
            </span>
          </div>
        )}

        <div className="absolute inset-x-2 top-2 flex flex-wrap items-start justify-between gap-1">
          {product.discountBadge && (
            <span className="bg-red-700 px-2 py-1 text-[10px] font-semibold text-white">
              {product.discountBadge}
            </span>
          )}
          <div className="ml-auto flex flex-col items-end gap-1">
            {product.tagBadge && (
              <span className="bg-white/95 px-2 py-1 text-[10px] font-medium text-gray-800">
                {product.tagBadge}
              </span>
            )}
            {product.isFeatured && (
              <span className="bg-emerald-800 px-2 py-1 text-[10px] font-medium text-white">
                Featured
              </span>
            )}
          </div>
        </div>
      </ProductCardLink>

      <div className="flex grow flex-col gap-1.5 pt-3">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="truncate text-[10px] font-medium uppercase text-gray-500">
            {product.category}
          </span>
          {product.rating != null && product.rating > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-gray-600">
              <Star className="size-3 fill-amber-400 text-amber-500" />
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>

        <ProductCardLink
          slug={product.slug}
          className="line-clamp-2 min-h-9 text-sm font-medium leading-5 text-gray-900 hover:underline"
        >
          {product.name}
        </ProductCardLink>

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-1">
          <span
            className={`text-sm font-semibold ${unavailable ? "text-gray-500" : "text-gray-950"}`}
          >
            {product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {product.originalPrice}
            </span>
          )}
        </div>
        <div className="flex min-h-5 items-center justify-between gap-2 text-[10px] text-gray-500">
          <span className="truncate">
            {[
              product.optionsText,
              product.colors?.length ? `${product.colors.length} colors` : null,
              product.sizes?.length ? `${product.sizes.length} sizes` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
          <span
            className={
              unavailable
                ? "shrink-0 font-medium text-red-700"
                : "shrink-0 font-medium text-emerald-800"
            }
          >
            {unavailable ? stockLabel : "In stock"}
          </span>
        </div>
      </div>
    </article>
  );
}

function ProductCardLink({
  slug,
  className,
  ariaLabel,
  children,
}: {
  slug?: string;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (!slug) return <div className={className}>{children}</div>;

  return (
    <Link
      href={`/shop/${encodeURIComponent(slug)}`}
      aria-label={ariaLabel}
      className={className}
    >
      {children}
    </Link>
  );
}
