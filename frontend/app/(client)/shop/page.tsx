"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  RotateCcw,
} from "lucide-react";
import { useCategories, useProducts, useSubcategories } from "@/hooks";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

const COLLECTIONS_LIST = [
  { label: "New arrivals", value: "new-arrivals" },
  { label: "Best sellers", value: "best-sellers" },
  { label: "Featured selections", value: "featured" },
];

const ITEMS_PER_PAGE = 9;

// ==========================================
// SHOP CONTENT COMPONENT
// ==========================================
function ShopContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. Initial State from URL params
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    () => searchParams.get("categories")?.split(",").filter(Boolean) || [],
  );
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    () => searchParams.get("subcategories")?.split(",").filter(Boolean) || [],
  );
  const [selectedCollections, setSelectedCollections] = useState<string[]>(
    () => searchParams.get("collections")?.split(",").filter(Boolean) || [],
  );
  const [maxPrice, setMaxPrice] = useState<number>(() => {
    const p = searchParams.get("maxPrice");
    return p ? Number(p) : 10000;
  });
  const [minPrice, setMinPrice] = useState<number>(() => {
    const p = searchParams.get("minPrice");
    return p ? Number(p) : 0;
  });
  const [minRating, setMinRating] = useState<number>(() => {
    const rating = searchParams.get("rating");
    return rating ? Number(rating) : 0;
  });
  const [inStockOnly, setInStockOnly] = useState<boolean>(() => {
    return searchParams.get("inStock") === "true";
  });
  const [sortBy, setSortBy] = useState<string>(() => {
    return searchParams.get("sort") || "newest";
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const page = searchParams.get("page");
    return page ? Number(page) : 1;
  });

  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const subcategoriesQuery = useSubcategories({ page: 1, limit: 100 });
  const productsQuery = useProducts({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    ...(minPrice > 0 ? { minPrice } : {}),
    ...(maxPrice < 10000 ? { maxPrice } : {}),
    ...(selectedCategories.length ? { categoryIds: selectedCategories } : {}),
    ...(selectedSubcategories.length
      ? { subcategoryIds: selectedSubcategories }
      : {}),
    ...(minRating > 0 ? { minRating } : {}),
    ...(inStockOnly ? { status: "IN_STOCK" as const } : {}),
    ...(selectedCollections.length ? { collections: selectedCollections } : {}),
    sort: sortBy as "newest" | "price_asc" | "price_desc",
  });

  // Category filter search query inside sidebar
  const [categorySearch, setCategorySearch] = useState("");

  // 2. Synchronize State changes into URL Params
  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "" || value === "0") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  // Sync to URL when states change
  useEffect(() => {
    updateUrlParams({
      categories: selectedCategories.length
        ? selectedCategories.join(",")
        : null,
      subcategories: selectedSubcategories.length
        ? selectedSubcategories.join(",")
        : null,
      collections: selectedCollections.length
        ? selectedCollections.join(",")
        : null,
      minPrice: minPrice > 0 ? minPrice.toString() : null,
      maxPrice: maxPrice < 10000 ? maxPrice.toString() : null,
      rating: minRating > 0 ? minRating.toString() : null,
      sizes: null,
      colors: null,
      inStock: inStockOnly ? "true" : null,
      sort: sortBy !== "newest" ? sortBy : null,
      page: currentPage > 1 ? currentPage.toString() : null,
    });
  }, [
    selectedCategories,
    selectedSubcategories,
    selectedCollections,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    currentPage,
    updateUrlParams,
  ]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedCollections([]);
    setMinPrice(0);
    setMaxPrice(10000);
    setMinRating(0);
    setInStockOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Toggle helpers
  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    item: string,
  ) => {
    setCurrentPage(1);
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const apiProducts = productsQuery.data?.items ?? [];
  const paginatedProducts = apiProducts.map((product) => {
    const variants = product.variants ?? [];
    const prices = variants
      .map((variant) => Number(variant.price))
      .filter(Number.isFinite);
    const comparePrices = variants
      .map((variant) => Number(variant.compareAtPrice))
      .filter((price) => Number.isFinite(price) && price > 0);
    const lowestPrice = prices.length ? Math.min(...prices) : 0;
    const highestPrice = prices.length ? Math.max(...prices) : lowestPrice;
    const categoryNames =
      product.categories?.map(({ category }) => category.name) ?? [];
    const productOptions = variants.flatMap((variant) => variant.options ?? []);
    const optionValues = (name: string) => [
      ...new Set(
        productOptions
          .filter((option) => option.name.toLowerCase() === name.toLowerCase())
          .map((option) => option.value),
      ),
    ];
    const formatPrice = (price: number) => `৳${price.toLocaleString("en-BD")}`;

    return {
      id: product.id,
      name: product.name,
      category: categoryNames[0] ?? "Collection",
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
      rating: product.averageRating,
      collections: [
        ...(product.isNew ? ["new-arrivals"] : []),
        ...(product.isBestSeller ? ["best-sellers"] : []),
        ...(product.isFeatured ? ["featured"] : []),
      ],
      optionsText: `${variants.length} ${variants.length === 1 ? "option" : "options"}`,
      inStock: product.status === "IN_STOCK",
      stockStatus: product.status,
      sizes: optionValues("Size"),
      colors: optionValues("Color"),
    };
  });
  const totalProducts = productsQuery.data?.pagination.total ?? 0;
  const totalPages = Math.max(1, productsQuery.data?.pagination.pages ?? 1);
  const categoryRecords = categoriesQuery.data?.items ?? [];
  const subcategoryRecords = subcategoriesQuery.data?.items ?? [];
  const visibleSubcategories = subcategoryRecords.filter(
    (subcategory) =>
      selectedCategories.length === 0 ||
      selectedCategories.includes(subcategory.categoryId),
  );
  const filteredCategoriesList = categoryRecords.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link href="/" className="hover:text-black transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-gray-900 font-medium">Collections</span>
      </nav>

      {/* Layout Grid: Sidebar (Left) & Products (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================
            LEFT: FILTERS SIDEBAR
           ======================================================== */}
        <aside className="lg:col-span-3 space-y-6 bg-white pr-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-700" />
              <h3 className="text-sm font-semibold tracking-wide">Filters</h3>
            </div>
            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="text-[11px] text-gray-400 hover:text-black flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* 1. Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-800">Categories</h4>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full text-xs bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-7 pr-3 focus:outline-none focus:border-black transition"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" />
            </div>

            {/* Checkboxes List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
              {filteredCategoriesList.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2.5 text-gray-600 hover:text-black cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => {
                      toggleItem(
                        selectedCategories,
                        setSelectedCategories,
                        category.id,
                      );
                      setSelectedSubcategories([]);
                    }}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {visibleSubcategories.length > 0 && (
            <div className="space-y-3 border-t border-gray-100 pt-5">
              <h4 className="text-xs font-semibold text-gray-800">
                Subcategories
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
                {visibleSubcategories.map((subcategory) => (
                  <label
                    key={subcategory.id}
                    className="flex items-center gap-2.5 text-gray-600 hover:text-black cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubcategories.includes(subcategory.id)}
                      onChange={() =>
                        toggleItem(
                          selectedSubcategories,
                          setSelectedSubcategories,
                          subcategory.id,
                        )
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black"
                    />
                    <span>{subcategory.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 2. Collections */}
          <div className="space-y-2.5 border-t border-gray-100 pt-5">
            <h4 className="text-xs font-semibold text-gray-800">Collections</h4>
            <div className="space-y-2 text-xs">
              {COLLECTIONS_LIST.map((col) => (
                <label
                  key={col.value}
                  className="flex items-center gap-2.5 text-gray-600 hover:text-black cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes(col.value)}
                    onChange={() =>
                      toggleItem(
                        selectedCollections,
                        setSelectedCollections,
                        col.value,
                      )
                    }
                    className="w-3.5 h-3.5 rounded border-gray-300 text-black focus:ring-black accent-black"
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Price Range */}
          <div className="space-y-3 border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-800">
                Price range
              </h4>
              <span className="text-xs font-medium text-gray-600">
                ৳{minPrice} – ৳{maxPrice}
                {maxPrice === 10000 && "+"}
              </span>
            </div>

            <label className="flex items-center justify-between gap-3 text-xs text-gray-500">
              Minimum price
              <input
                aria-label="Minimum price"
                type="number"
                min={0}
                max={maxPrice}
                value={minPrice}
                onChange={(event) => {
                  setCurrentPage(1);
                  setMinPrice(
                    Math.min(
                      maxPrice,
                      Math.max(0, Number(event.target.value) || 0),
                    ),
                  );
                }}
                className="w-24 rounded border border-gray-200 px-2 py-1 text-right text-xs text-gray-800"
              />
            </label>

            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => {
                setCurrentPage(1);
                const nextMaxPrice = Number(e.target.value);
                setMaxPrice(nextMaxPrice);
                setMinPrice((currentMinPrice) =>
                  Math.min(currentMinPrice, nextMaxPrice),
                );
              }}
              className="w-full accent-black cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[11px] text-gray-400">
              <span>৳0</span>
              <span>৳10000+</span>
            </div>
          </div>

          <div className="space-y-2.5 border-t border-gray-100 pt-5">
            <h4 className="text-xs font-semibold text-gray-800">
              Minimum rating
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  aria-pressed={minRating === rating}
                  onClick={() => {
                    setCurrentPage(1);
                    setMinRating(minRating === rating ? 0 : rating);
                  }}
                  className={`h-7 px-2.5 text-[11px] font-medium rounded border transition ${
                    minRating === rating
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-700 border-gray-200 hover:border-black"
                  }`}
                >
                  {rating}+ stars
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only */}
          <div className="border-t border-gray-100 pt-5 flex items-center justify-between">
            <label
              htmlFor="in-stock-toggle"
              className="text-xs font-semibold text-gray-800 cursor-pointer select-none"
            >
              In stock only
            </label>
            <button
              id="in-stock-toggle"
              role="switch"
              aria-checked={inStockOnly}
              onClick={() => {
                setCurrentPage(1);
                setInStockOnly(!inStockOnly);
              }}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                inStockOnly ? "bg-black" : "bg-gray-200"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  inStockOnly ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </aside>

        {/* ========================================================
            RIGHT: PRODUCTS GRID & HEADER
           ======================================================== */}
        <section className="lg:col-span-9 space-y-6">
          {/* Top Bar: Count & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-50">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {paginatedProducts.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {totalProducts}
              </span>{" "}
              products
            </p>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-gray-400">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSortBy(e.target.value);
                  }}
                  className="appearance-none bg-transparent text-xs font-semibold text-gray-800 pr-6 pl-1 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-0 top-1.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {productsQuery.isFetching ? (
            <div
              role="status"
              aria-label="Loading products"
              className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3"
            >
              {Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                <article key={index} className="flex min-w-0 flex-col">
                  <Skeleton className="aspect-3/4 w-full rounded-none" />
                  <div className="flex flex-col gap-2 pt-3">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </article>
              ))}
            </div>
          ) : productsQuery.isError ? (
            <div className="py-24 text-center text-sm text-red-700">
              Products could not be loaded. Please try again.
            </div>
          ) : paginatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm font-medium text-gray-600">
                No products match your filters
              </p>
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-black underline hover:no-underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalProducts > 0 && (
            <div className="flex items-center justify-between pt-10 border-t border-gray-100 text-xs">
              <span className="text-gray-400">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-black disabled:opacity-40 disabled:hover:border-gray-200 flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-3 h-3" /> Prev
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-full text-xs font-medium transition ${
                        currentPage === pageNum
                          ? "bg-black text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-black disabled:opacity-40 disabled:hover:border-gray-200 flex items-center gap-1 transition"
                >
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs text-gray-400">
          Loading shop collections...
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
