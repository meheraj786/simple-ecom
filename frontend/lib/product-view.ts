import type { Product as ProductCardData } from "@/components/ProductCard";
import type { Product } from "@/server/types";

export function toProductCard(product: Product): ProductCardData {
  const variants = product.variants ?? [];
  const prices = variants
    .map((variant) => Number(variant.price))
    .filter(Number.isFinite);
  const comparePrices = variants
    .map((variant) => Number(variant.compareAtPrice))
    .filter((price) => Number.isFinite(price) && price > 0);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : lowestPrice;
  const category = product.categories?.[0]?.category.name ?? "Collection";
  const options = variants.flatMap((variant) => variant.options ?? []);
  const optionValues = (name: string) => [
    ...new Set(
      options
        .filter((option) => option.name.toLowerCase() === name.toLowerCase())
        .map((option) => option.value),
    ),
  ];
  const formatPrice = (price: number) => `৳${price.toLocaleString("en-BD")}`;

  return {
    id: product.id,
    name: product.name,
    category,
    price:
      highestPrice > lowestPrice
        ? `${formatPrice(lowestPrice)}–${formatPrice(highestPrice)}`
        : formatPrice(lowestPrice),
    ...(comparePrices.length
      ? { originalPrice: formatPrice(Math.max(...comparePrices)) }
      : {}),
    image:
      product.baseImage ??
      variants.find((variant) => variant.images[0])?.images[0] ??
      null,
    ...(product.isNew ? { tagBadge: "New" } : {}),
    ...(product.isBestSeller ? { tagBadge: "Best seller" } : {}),
    isFeatured: product.isFeatured,
    ...(product.averageRating > 0 ? { rating: product.averageRating } : {}),
    collections: [
      ...(product.isNew ? ["new-arrivals"] : []),
      ...(product.isBestSeller ? ["best-sellers"] : []),
      ...(product.isFeatured ? ["featured"] : []),
    ],
    optionsText: `${variants.length} ${variants.length === 1 ? "option" : "options"}`,
    stockStatus: product.status,
    inStock: product.status === "IN_STOCK",
    sizes: optionValues("Size"),
    colors: optionValues("Color"),
  };
}
