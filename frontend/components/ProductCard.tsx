import { Heart } from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  image: string;
  discountBadge?: string;
  tagBadge?: string;
  isFeatured?: boolean;
  optionsText?: string;
  inStock?: boolean;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative flex flex-col bg-white rounded-lg overflow-hidden transition-all duration-300">
      {/* Image Wrap */}
      <div className="relative aspect-[3/4] w-full bg-gray-50 overflow-hidden rounded-md border border-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Wishlist Button */}
        <button
          aria-label="Wishlist"
          className="absolute top-2.5 left-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-600 hover:text-red-500 hover:bg-white shadow-sm transition"
        >
          <Heart className="w-3.5 h-3.5" />
        </button>

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {product.discountBadge && (
            <span className="bg-[#E53935] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
              {product.discountBadge}
            </span>
          )}
          {product.tagBadge && (
            <span className="bg-black/80 backdrop-blur-sm text-white text-[8px] font-medium px-1.5 py-0.5 rounded-sm flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-white inline-block" />
              {product.tagBadge}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[8px] font-medium px-1.5 py-0.5 rounded-sm">
              Featured
            </span>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="pt-3 pb-1 flex flex-col flex-grow">
        <span className="text-[10px] text-gray-400 font-medium tracking-wider capitalize">
          {product.category}
        </span>
        <h4 className="text-xs font-medium text-gray-800 line-clamp-1 mt-0.5 group-hover:text-black">
          {product.name}
        </h4>

        {/* Price & Options */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-gray-900">{product.price}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
          {product.optionsText && (
            <span className="text-[10px] text-gray-400">
              {product.optionsText}
            </span>
          )}
          {product.inStock === false && (
            <span className="text-[10px] font-semibold text-red-500">
              Out of stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
