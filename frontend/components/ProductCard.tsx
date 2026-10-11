import { Heart, Star, ShoppingBag, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface Product {
  id: string;
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
    <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300">
      {/* Image Wrap */}
      <div className="relative aspect-3/4 w-full bg-gray-50 overflow-hidden rounded-lg border border-gray-100">
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

        {/* Wishlist Button */}
        <button
          aria-label="Wishlist"
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white shadow-sm transition-all hover:scale-110 z-10"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1 z-10">
          {product.discountBadge && (
            <span className="bg-[#E53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm">
              {product.discountBadge}
            </span>
          )}
          {product.tagBadge && (
            <span className="bg-black/85 backdrop-blur-sm text-white text-[8px] font-medium px-1.5 py-0.5 rounded-sm flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block" />
              {product.tagBadge}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[8px] font-medium px-1.5 py-0.5 rounded-sm">
              Featured
            </span>
          )}
        </div>

        {/* Hover Quick Actions */}
        {!unavailable && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex">
            <button className="flex-1 bg-black text-white text-[10px] font-semibold py-2.5 flex items-center justify-center gap-1.5 hover:bg-gray-900 transition">
              <ShoppingBag className="w-3 h-3" /> QUICK ADD
            </button>
            <button
              aria-label="Quick view"
              className="w-10 bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition border-l border-white/10"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="pt-3 pb-1 flex flex-col grow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium tracking-wider capitalize">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-gray-500 font-medium">
              {product.rating ?? 4.8}
            </span>
          </div>
        </div>

        <Link
          href={`/shop/${product.id}`}
          className="text-xs font-medium text-gray-800 line-clamp-1 mt-0.5 group-hover:text-black transition-colors"
        >
          {product.name}
        </Link>

        {/* Price & Options */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-baseline gap-1.5">
            <span
              className={`font-semibold ${
                unavailable ? "text-gray-400" : "text-gray-900"
              }`}
            >
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
          {product.optionsText && !unavailable && (
            <span className="text-[10px] text-gray-400">
              {product.optionsText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
