"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Heart,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Copy,
  Check,
  Star,
  Phone,
  Mail,
  MapPin,
  Send,
  MessageCircle,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText("NEWMEM20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased selection:bg-black selection:text-white">
      {/* 1. Header / Navbar Component */}
      <Navbar />

      <main className="space-y-20 pb-20">
        {/* ========================================================
            2. HERO SECTION
           ======================================================== */}
        <section className="relative w-full h-[520px] md:h-[600px] bg-[#E8E6E1] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=1920&q=80"
            alt="The Men Edition"
            fill
            priority
            className="object-cover object-right md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

          <div className="relative max-w-7xl mx-auto h-full flex items-center px-6 sm:px-8">
            <div className="max-w-md text-white space-y-4">
              <span className="inline-block text-[10px] tracking-[0.25em] uppercase font-semibold text-gray-200">
                FEATURED CATEGORY SPOTLIGHT
              </span>
              <h1 className="text-4xl sm:text-6xl font-serif tracking-tight leading-none">
                The Men <br />
                <span className="italic font-light">Edition.</span>
              </h1>
              <p className="text-xs text-gray-300 font-light leading-relaxed max-w-xs">
                Curated lifestyle pieces built with precision and durability.
              </p>
              <div>
                <Link
                  href="#"
                  className="inline-flex items-center gap-2 bg-black text-white text-xs font-semibold px-6 py-3 rounded hover:bg-gray-900 transition"
                >
                  SHOP MEN NOW
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            3. SHOP BY CATEGORY (Department 01)
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
                DEPARTMENT 01
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                SHOP BY CATEGORY
              </h2>
            </div>
            <Link
              href="#"
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase"
            >
              VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {shopCategories.map((cat) => (
              <div
                key={cat.id}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-[10px] text-gray-300 block font-light">
                    {cat.code}
                  </span>
                  <h3 className="text-base font-semibold leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-gray-300 flex items-center gap-1 mt-1 group-hover:underline">
                    EXPLORE <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            4. CURATED CATEGORIES (Department 02)
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="mb-6">
            <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
              DEPARTMENT 02
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
              CURATED CATEGORIES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curatedCategories.map((cat) => (
              <div
                key={cat.id}
                className="group relative h-48 sm:h-64 rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
              >
                <Image
                  src={cat.image}
                  alt={cat.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-6 text-white">
                  <h3 className="text-lg sm:text-xl font-serif font-semibold">
                    {cat.title}
                  </h3>
                  <span className="text-[11px] text-gray-200 flex items-center gap-1 mt-1 group-hover:underline">
                    SHOP COLLECTION <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            5. FEATURED COLLECTION
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
                CURATED SHOWCASE
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                FEATURED COLLECTION
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase mr-2"
              >
                VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                aria-label="Previous"
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                aria-label="Next"
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            6. NEW ARRIVALS
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
                SEASONAL DROP
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                NEW ARRIVALS
              </h2>
            </div>
            <Link
              href="#"
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase"
            >
              VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newArrivalProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            7. FOOTWEAR
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
                CATALOG GRID
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                FOOTWEAR
              </h2>
            </div>
            <Link
              href="#"
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase"
            >
              VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {footwearProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            8. WATCHES & ACCESSORIES
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
                CURATED SHOWCASE
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                WATCHES
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase mr-2"
              >
                VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                aria-label="Previous"
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <button
                aria-label="Next"
                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {watchesAccessoriesProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            9. WINTER WEAR
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block">
                CATALOG GRID
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                WINTER WEAR
              </h2>
            </div>
            <Link
              href="#"
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 tracking-wider uppercase"
            >
              VIEW ALL <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {winterWearProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* ========================================================
            10. PROMO / DISCOUNT CTA BANNER
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-[#1C1C1E] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3 z-10 max-w-xl">
              <span className="text-[11px] text-amber-400 font-semibold tracking-wider flex items-center gap-1">
                ⚡ NEW COMER?!?!
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold">
                Grab 20% Off On Your First Order
              </h3>
              <p className="text-xs text-gray-400">
                Limited time promotion across all essential apparel and tech.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleCopyCode}
                  className="bg-zinc-800/80 border border-zinc-700 hover:border-zinc-500 rounded-full px-4 py-2 text-xs flex items-center gap-2 text-gray-300 hover:text-white transition"
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
                className="bg-white text-black text-xs font-semibold px-6 py-3 rounded-full hover:bg-gray-100 flex items-center gap-2 transition"
              >
                SHOP THE SALE <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            11. COMMUNITY FEEDBACK / REVIEWS
           ======================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-gray-400 font-medium block mb-1">
            COMMUNITY FEEDBACK
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-10">
            What our customers say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {customerReviews.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex gap-1 text-black mb-3">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-black" />
                    ))}
                  </div>
                  <p className="text-xs italic text-gray-700 mb-2">
                    {item.quote}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Reviewed on:{" "}
                    <span className="underline">{item.reviewedItem}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 mt-6 pt-4 border-t border-gray-50">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
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
            12. GET IN TOUCH / CONTACT FORM
           ======================================================== */}
        <section className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-10">
            <span className="inline-block text-[10px] text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium mb-2">
              🎧 24/7 Dedicated Support
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold">
              Get in touch
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              We can&apos;t wait to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: Contact Info */}
            <div className="md:col-span-5 bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                  <HeadphonesIconCustom />
                </div>
                <div>
                  <h4 className="text-xs font-semibold">Contact Details</h4>
                  <p className="text-[10px] text-gray-400">
                    Reach us directly through our official channels
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> DIRECT HELPLINE
                  </span>
                  <span className="font-medium text-gray-800">Phone</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block flex items-center gap-1.5">
                    <Mail className="w-3 h-3" /> EMAIL ADDRESS
                  </span>
                  <span className="font-medium text-gray-800">Email</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] text-gray-400 block flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" /> STORE ADDRESS
                  </span>
                  <span className="font-medium text-gray-800">Address</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-gray-400 font-medium block mb-2">
                  Instant Support
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 py-2 rounded-lg border border-emerald-100 font-medium hover:bg-emerald-100 transition">
                    WhatsApp
                  </button>
                  <button className="flex items-center justify-center gap-1 text-[11px] bg-blue-50 text-blue-700 py-2 rounded-lg border border-blue-100 font-medium hover:bg-blue-100 transition">
                    Messenger
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Message Form */}
            <div className="md:col-span-7 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8">
              <h4 className="text-sm font-semibold mb-1">Send a Message</h4>
              <p className="text-[11px] text-gray-400 mb-6">
                Fill out the form below and we will get back to you as soon as
                possible.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +880 1700-000000"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                      Subject / Order ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Order #1234 Inquiry"
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-gray-600 block mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="How can we help you? Describe your inquiry..."
                    className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg p-2.5 focus:outline-none focus:border-black resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white text-xs font-semibold py-3 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          aria-label="Chat Support"
          className="w-12 h-12 bg-black text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* 13. Footer Component */}
      <Footer />
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
