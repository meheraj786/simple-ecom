"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContactMessageForm } from "@/components/contact-message-form";
import {
  useCategories,
  useCategoryProducts,
  useProducts,
  useReviews,
} from "@/hooks";
import { toProductCard } from "@/lib/product-view";
import {
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Copy,
  Check,
  Star,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { Product, ProductCard } from "@/components/ProductCard";

// ==========================================
// DUMMY DATA DEFINITIONS
// ==========================================

interface Category {
  id: string;
  name: string;
  code: string;
  image: string;
}

interface CuratedCategory {
  id: string;
  title: string;
  image: string;
}

interface Testimonial {
  id: string;
  quote: string;
  reviewedItem: string;
  customerName: string;
  rating: number;
}

// 1. Categories
const shopCategories: Category[] = [
  {
    id: "1",
    name: "Men",
    code: "01",
    image:
      "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "2",
    name: "Women",
    code: "02",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "3",
    name: "Kids & Baby",
    code: "03",
    image:
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "4",
    name: "Fashion Accessories",
    code: "04",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
  },
];

// 2. Curated Categories (2x2 Grid)
const curatedCategories: CuratedCategory[] = [
  {
    id: "c1",
    title: "Ethnic & Traditional",
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "c2",
    title: "Bags & Luggage",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "c3",
    title: "Activewear",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "c4",
    title: "Winter Wear",
    image:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80",
  },
];

// 3. Products
const featuredProducts: Product[] = [
  {
    id: "p1",
    name: "Girls Floral Summer Party Frock",
    category: "Kids & Baby",
    price: "৳1250-1350",
    originalPrice: "৳1450",
    image:
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-14%",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "4 options",
  },
  {
    id: "p2",
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: "৳2850-2950",
    originalPrice: "৳3200",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-11%",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "4 options",
  },
  {
    id: "p3",
    name: "Luxury Leather Handbag",
    category: "Bags & Luggage",
    price: "৳3800",
    originalPrice: "৳4200",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-14%",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "2 options",
  },
  {
    id: "p4",
    name: "Oxford Genuine Leather Formal Shoes",
    category: "Footwear",
    price: "৳3400",
    originalPrice: "৳3800",
    image:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-11%",
    tagBadge: "Best seller",
    isFeatured: true,
    optionsText: "3 options",
  },
  {
    id: "p5",
    name: "Elegant Flowing Red Party Gown",
    category: "Women",
    price: "৳2300-2400",
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
    optionsText: "3 options",
  },
];

const newArrivalProducts: Product[] = [
  {
    id: "na1",
    name: "Girls Floral Summer Party Frock",
    category: "Kids & Baby",
    price: "৳1250-1350",
    originalPrice: "৳1450",
    image:
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-14%",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "4 options",
  },
  {
    id: "na2",
    name: "Kids Dinosaur Graphic Cotton T-Shirt",
    category: "Kids & Baby",
    price: "৳420-450",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80",
    tagBadge: "Best seller",
    optionsText: "4 options",
  },
  {
    id: "na3",
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: "৳2850-2950",
    originalPrice: "৳3200",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-11%",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "4 options",
  },
];

const footwearProducts: Product[] = [
  {
    id: "fw1",
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: "৳2850-2950",
    originalPrice: "৳3200",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-11%",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "4 options",
  },
  {
    id: "fw2",
    name: "Oxford Genuine Leather Formal Shoes",
    category: "Footwear",
    price: "৳3400",
    originalPrice: "৳3800",
    image:
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-11%",
    tagBadge: "Best seller",
    isFeatured: true,
    optionsText: "3 options",
  },
];

const watchesAccessoriesProducts: Product[] = [
  {
    id: "w1",
    name: "Girls Floral Summer Party Frock",
    category: "Kids & Baby",
    price: "৳1250-1350",
    originalPrice: "৳1450",
    image:
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-14%",
    tagBadge: "New",
    isFeatured: true,
  },
  {
    id: "w2",
    name: "Kids Dinosaur Graphic Cotton T-Shirt",
    category: "Kids & Baby",
    price: "৳420-450",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80",
    tagBadge: "Best seller",
  },
  {
    id: "w3",
    name: "Classic Pointed Stiletto Heels",
    category: "Footwear",
    price: "৳2850-2950",
    originalPrice: "৳3200",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
    discountBadge: "-11%",
    tagBadge: "New",
    isFeatured: true,
  },
  {
    id: "w4",
    name: "Italian Full-Grain Leather Belt",
    category: "Fashion Accessories",
    price: "৳450-490",
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80",
    tagBadge: "Best seller",
    optionsText: "4 options",
  },
  {
    id: "w5",
    name: "Performance Sports Watch",
    category: "Accessories",
    price: "Out of stock",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
    inStock: false,
  },
];

const winterWearProducts: Product[] = [
  {
    id: "ww1",
    name: "Classic Slim-Fit Denim Jacket",
    category: "Winter Wear",
    price: "৳2580-2680",
    originalPrice: "৳2950",
    image:
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80",
    tagBadge: "New",
    isFeatured: true,
    optionsText: "3 options",
  },
];

// 4. Testimonials
const customerReviews: Testimonial[] = [
  {
    id: "r1",
    quote: '"Awesome Product!!"',
    reviewedItem: "Classic Pointed Stiletto Heels",
    customerName: "Customer",
    rating: 5,
  },
  {
    id: "r2",
    quote: '"Amazing Product Bro!!"',
    reviewedItem: "Girls Floral Summer Party Frock",
    customerName: "Customer",
    rating: 5,
  },
  {
    id: "r3",
    quote: '"It\'s a nice and comfortable product."',
    reviewedItem: "Classic Slim-Fit Denim Jacket",
    customerName: "Customer",
    rating: 5,
  },
];

// ==========================================
// MAIN HOMEPAGE COMPONENT
// ==========================================
export default function HomePage() {
  const [copied, setCopied] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const categoriesQuery = useCategories({ page: 1, limit: 100 });
  const featuredQuery = useProducts({
    page: 1,
    limit: 5,
    collections: ["featured"],
  });
  const newArrivalsQuery = useProducts({
    page: 1,
    limit: 4,
    collections: ["new-arrivals"],
  });
  const bestSellersQuery = useProducts({
    page: 1,
    limit: 5,
    collections: ["best-sellers"],
  });
  const catalogQuery = useProducts({ page: 1, limit: 100 });
  const reviewsQuery = useReviews({ page: 1, limit: 3 });

  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1920&q=85",
      alt: "Contemporary menswear collection",
      eyebrow: "THE EVERYDAY EDIT",
      title: "Made for\nthe everyday.",
      description: "Considered essentials for wherever the day takes you.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1760565030264-c737b92e887d?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D",
      alt: "New season fashion collection",
      eyebrow: "NEW SEASON",
      title: "A fresh point\nof view.",
      description: "Find the pieces that make getting dressed feel easy.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=85",
      alt: "Inside the E-Com fashion store",
      eyebrow: "CURATED FOR YOU",
      title: "Good things\nare in store.",
      description: "Explore thoughtful finds across the whole collection.",
    },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroIndex((index) => (index + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const apiCategories = categoriesQuery.data?.items ?? [];
  const categoryProductQueries = useCategoryProducts(
    apiCategories.map((category) => category.id),
  );
  const homeCategories = apiCategories.map((category, index) => ({
    id: category.id,
    name: category.name,
    code: String(index + 1).padStart(2, "0"),
    image:
      category.image ??
      shopCategories[index % shopCategories.length]?.image ??
      "",
  }));
  const homeCuratedCategories = apiCategories
    .slice(0, 4)
    .map((category, index) => ({
      id: category.id,
      title: category.name,
      image:
        category.image ??
        curatedCategories[index % curatedCategories.length]?.image ??
        "",
    }));
  const homeFeaturedProducts = featuredQuery.isPending
    ? featuredProducts
    : (featuredQuery.data?.items ?? []).map(toProductCard);
  const homeNewArrivals = newArrivalsQuery.isPending
    ? newArrivalProducts
    : (newArrivalsQuery.data?.items ?? []).map(toProductCard);
  const allProducts = catalogQuery.data?.items ?? [];
  const homeFootwear = catalogQuery.isPending
    ? footwearProducts
    : allProducts
        .filter((product) =>
          product.categories?.some(({ category }) =>
            category.name.toLowerCase().includes("footwear"),
          ),
        )
        .slice(0, 5)
        .map(toProductCard);
  const homeAccessories = catalogQuery.isPending
    ? watchesAccessoriesProducts
    : allProducts
        .filter((product) =>
          product.categories?.some(({ category }) =>
            /watch|accessor/i.test(category.name),
          ),
        )
        .slice(0, 5)
        .map(toProductCard);
  const homeWinterWear = catalogQuery.isPending
    ? winterWearProducts
    : allProducts
        .filter((product) =>
          product.categories?.some(({ category }) =>
            category.name.toLowerCase().includes("winter"),
          ),
        )
        .slice(0, 5)
        .map(toProductCard);
  const homeBestSellers = bestSellersQuery.isPending
    ? watchesAccessoriesProducts
    : (bestSellersQuery.data?.items ?? []).map(toProductCard);
  const homeReviews = reviewsQuery.isPending
    ? customerReviews
    : (reviewsQuery.data?.items ?? []).map((review) => ({
        id: review.id,
        quote: review.comment || "A verified customer review.",
        reviewedItem: "Customer review",
        customerName: review.userName,
        rating: review.rating,
      }));

  const handleCopyCode = () => {
    navigator.clipboard.writeText("NEWMEM20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-black selection:text-white">
      <main className="space-y-16 sm:space-y-24 pb-20">
        {/* ========================================================
            HERO SECTION
           ======================================================== */}
        <section
          aria-label="Featured collections"
          className="group relative h-[520px] w-full overflow-hidden bg-[#26352f] md:h-[640px]"
        >
          <Image
            key={heroSlides[heroIndex].image}
            src={heroSlides[heroIndex].image}
            alt={heroSlides[heroIndex].alt}
            fill
            priority
            sizes="100vw"
            className="animate-in fade-in object-cover object-center duration-700"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-black/5" />

          <div className="relative mx-auto flex h-full max-w-7xl items-center px-6 sm:px-8">
            <div className="max-w-lg space-y-5 text-white">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-white/80">
                <span className="h-px w-7 bg-amber-400" />
                {heroSlides[heroIndex].eyebrow}
              </span>
              <h1 className="whitespace-pre-line font-serif text-5xl font-semibold leading-[1.02] sm:text-7xl">
                {heroSlides[heroIndex].title}
              </h1>
              <p className="max-w-sm text-sm leading-6 text-white/80">
                {heroSlides[heroIndex].description}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white px-6 py-3.5 text-xs font-semibold text-black transition-colors hover:bg-gray-100"
                >
                  SHOP COLLECTION
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-6 mx-auto flex max-w-7xl items-center justify-between px-6 sm:px-8">
            <button
              type="button"
              aria-label="Previous banner"
              onClick={() =>
                setHeroIndex(
                  (index) =>
                    (index + heroSlides.length - 1) % heroSlides.length,
                )
              }
              className="grid size-10 place-items-center border border-white/50 text-white transition hover:bg-white hover:text-black"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex items-center gap-2" aria-label="Choose banner">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.eyebrow}
                  type="button"
                  aria-label={`Show banner ${index + 1}`}
                  aria-current={heroIndex === index ? "true" : undefined}
                  onClick={() => setHeroIndex(index)}
                  className={`h-1.5 transition-all ${heroIndex === index ? "w-8 bg-white" : "w-3 bg-white/50 hover:bg-white/80"}`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next banner"
              onClick={() =>
                setHeroIndex((index) => (index + 1) % heroSlides.length)
              }
              className="grid size-10 place-items-center border border-white/50 text-white transition hover:bg-white hover:text-black"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </section>

        {/* ========================================================
            SHOP BY CATEGORY
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader eyebrow="DEPARTMENT 01" title="SHOP BY CATEGORY" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {homeCategories.slice(0, 4).map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?categories=${encodeURIComponent(cat.id)}`}
                className="group relative aspect-3/4 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[10px] text-gray-300 block font-light">
                    {cat.code}
                  </span>
                  <h3 className="text-base sm:text-lg font-semibold leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-gray-300 flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    EXPLORE <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================
            CURATED CATEGORIES
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader eyebrow="DEPARTMENT 02" title="CURATED CATEGORIES" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeCuratedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?categories=${encodeURIComponent(cat.id)}`}
                className="group relative h-52 sm:h-72 rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold">
                    {cat.title}
                  </h3>
                  <span className="text-[11px] text-gray-200 flex items-center gap-1 mt-2 group-hover:gap-2 transition-all">
                    SHOP COLLECTION <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================
            FEATURED COLLECTION
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            eyebrow="CURATED SHOWCASE"
            title="FEATURED COLLECTION"
            showArrows
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeFeaturedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader eyebrow="MOST LOVED" title="BEST SELLERS" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeBestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            NEW ARRIVALS
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader eyebrow="SEASONAL DROP" title="NEW ARRIVALS" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {homeNewArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {apiCategories.map((category, index) => {
          const query = categoryProductQueries[index];
          const products = query?.data?.items ?? [];

          return (
            <section
              key={category.id}
              className="max-w-7xl mx-auto px-4 sm:px-8"
              aria-busy={query?.isPending}
            >
              <SectionHeader eyebrow="SHOP BY CATEGORY" title={category.name} />
              {products.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={toProductCard(product)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {query?.isPending
                    ? "Loading products..."
                    : "No products in this category yet."}
                </p>
              )}
            </section>
          );
        })}

        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader eyebrow="CATALOG GRID" title="FOOTWEAR" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeFootwear.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            WATCHES & ACCESSORIES
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader
            eyebrow="CURATED SHOWCASE"
            title="Bags And Accessories"
            showArrows
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeAccessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            WINTER WEAR
           ======================================================== */}
        {/* <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <SectionHeader eyebrow="CATALOG GRID" title="WINTER WEAR" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {homeWinterWear.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section> */}

        {/* ========================================================
            PROMO / DISCOUNT CTA BANNER
           ======================================================== */}
        {/* <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-linear-to-br from-[#1C1C1E] to-[#0a0a0b] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
   
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />

            <div className="space-y-3 z-10 max-w-xl">
              <span className="text-[11px] text-amber-400 font-semibold tracking-wider flex items-center gap-1.5">
                ⚡ NEW COMER?!?!
              </span>
              <h3 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
                Grab 20% Off On Your First Order
              </h3>
              <p className="text-xs text-gray-400 max-w-sm">
                Limited time promotion across all essential apparel and tech.
              </p>
              <div className="pt-3">
                <button
                  onClick={handleCopyCode}
                  className="bg-zinc-800/80 border border-zinc-700 hover:border-zinc-500 rounded-full px-4 py-2.5 text-xs flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>
                    CODE: <strong className="text-white">NEWMEM20</strong>{" "}
                    (CLICK TO COPY)
                  </span>
                </button>
              </div>
            </div>

            <div className="z-10">
              <Link
                href="#"
                className="bg-white text-black text-xs font-semibold px-7 py-3.5 rounded-full hover:bg-gray-100 flex items-center gap-2 transition-all hover:gap-3"
              >
                SHOP THE SALE <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section> */}

        {/* ========================================================
            COMMUNITY FEEDBACK / REVIEWS
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block mb-1">
            COMMUNITY FEEDBACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-10">
            What our customers say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeReviews.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm italic text-gray-700 mb-3 leading-relaxed">
                    {item.quote}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Reviewed on:{" "}
                    <span className="underline">{item.reviewedItem}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-gray-50">
                  <div className="w-7 h-7 rounded-full bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white">
                    C
                  </div>
                  <div>
                    <span className="text-xs font-medium block">
                      {item.customerName}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold tracking-wider">
                      VERIFIED BUYER
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            GET IN TOUCH / CONTACT FORM
           ======================================================== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-[10px] text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium mb-3">
              🎧 24/7 Dedicated Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold">
              Get in touch
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              We can&apos;t wait to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Contact Info */}
            <div className="md:col-span-5 bg-gray-50/60 border border-gray-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200/70">
                <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                  <HeadphonesIconCustom />
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Contact Details</h4>
                  <p className="text-[10px] text-gray-400">
                    Reach us directly through our official channels
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mb-1">
                    <Phone className="w-3 h-3" /> DIRECT HELPLINE
                  </span>
                  <span className="font-medium text-gray-800">
                    +880 1700-000000
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mb-1">
                    <Mail className="w-3 h-3" /> EMAIL ADDRESS
                  </span>
                  <span className="font-medium text-gray-800">
                    support@store.com
                  </span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3 h-3" /> STORE ADDRESS
                  </span>
                  <span className="font-medium text-gray-800">
                    Dhaka, Bangladesh
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-gray-400 font-medium block mb-2">
                  Instant Support
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1.5 text-[11px] bg-emerald-50 text-emerald-700 py-2.5 rounded-lg border border-emerald-100 font-medium hover:bg-emerald-100 transition">
                    WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-1.5 text-[11px] bg-blue-50 text-blue-700 py-2.5 rounded-lg border border-blue-100 font-medium hover:bg-blue-100 transition">
                    Messenger
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-sm">
              <ContactMessageForm />
            </div>
          </div>
        </section>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          aria-label="Chat Support"
          className="w-[52px] h-[52px] bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   Reusable Section Header
   ========================================== */
function SectionHeader({
  eyebrow,
  title,
  showArrows,
}: {
  eyebrow: string;
  title: string;
  showArrows?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block mb-1">
          {eyebrow}
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
          {title}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="#"
          className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase mr-1 transition"
        >
          VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        {showArrows && (
          <>
            <button
              aria-label="Previous"
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              aria-label="Next"
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function HeadphonesIconCustom() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 003 3h1a2 2 0 002-2v-3a2 2 0 00-2-2H4a1 1 0 00-1 1v3zm18 0a3 3 0 01-3 3h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3a1 1 0 011 1v3z"
      />
    </svg>
  );
}
