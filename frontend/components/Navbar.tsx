"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Truck,
  HeadphonesIcon,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import Logo from "./Logo";
import { useCartStore } from "@/lib/cart-store";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "New Arrivals", href: "#" },
    { name: "Featured Items", href: "#" },
    { name: "Men", href: "#", hasDropdown: true },
    { name: "Women", href: "#", hasDropdown: true },
    { name: "Fashion Accessories", href: "#", hasDropdown: true },
    { name: "Ethnic & Traditional", href: "#", hasDropdown: true },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top Announcement Bar */}
      <div className="hidden sm:block bg-[#FAF9F6] border-b border-gray-100 text-[11px] text-gray-500 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Guest</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-black transition-colors"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-1.5 hover:text-black transition-colors"
            >
              <HeadphonesIcon className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile Hamburger */}
        <button
          aria-label="Toggle menu"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 -ml-1.5 text-gray-700 hover:text-black transition"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Logo />

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-gray-700">
          {navLinks.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                className="flex items-center gap-1 py-2 hover:text-black transition-colors"
              >
                {item.name}
                {item.hasDropdown && (
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:rotate-180 transition-transform duration-200" />
                )}
              </Link>
              {/* underline indicator */}
              <span className="absolute left-0 -bottom-0.5 w-0 h-[1.5px] bg-black group-hover:w-full transition-all duration-300" />

              {item.hasDropdown && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  <div className="w-44 bg-white border border-gray-100 rounded-lg shadow-lg py-2">
                    {["Best Sellers", "New In", "Sale", "View All"].map(
                      (sub) => (
                        <Link
                          key={sub}
                          href="#"
                          className="block px-4 py-2 text-xs text-gray-600 hover:text-black hover:bg-gray-50 transition"
                        >
                          {sub}
                        </Link>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 text-gray-700">
          <button
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:bg-gray-50 rounded-full transition"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            aria-label="Account"
            className="hidden sm:flex p-2 hover:bg-gray-50 rounded-full transition"
          >
            <User className="w-4 h-4" />
          </button>
          <button
            aria-label="Wishlist"
            className="relative p-2 hover:bg-gray-50 rounded-full transition"
          >
            <Heart className="w-4 h-4" />
            <span className="absolute top-0.5 right-0.5 text-[9px] bg-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative p-2 hover:bg-gray-50 rounded-full transition"
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 text-[9px] bg-black text-white min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center font-bold">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ============== SEARCH OVERLAY ============== */}
      {searchOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-start justify-center px-4 pt-24">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-black transition">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search for products, categories..."
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
              />
              <button
                aria-label="Close search"
                onClick={() => setSearchOpen(false)}
                className="p-1 text-gray-400 hover:text-black transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 px-1">
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Jacket", "Heels", "Handbag", "Watch", "Kids Wear"].map(
                  (term) => (
                    <button
                      key={term}
                      className="text-xs bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full text-gray-600 transition"
                    >
                      {term}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============== MOBILE MENU DRAWER ============== */}
      <div
        className={`fixed inset-0 z-60 transition-visibility ${
          mobileOpen ? "visible" : "invisible delay-300"
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Drawer */}
        <div
          className={`absolute top-0 left-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
            <Logo />
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-gray-500 hover:text-black transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-2">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50 transition"
              >
                {item.name}
                {item.hasDropdown && (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </Link>
            ))}
          </nav>

          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <Link
              href="#"
              className="flex items-center gap-2 text-xs text-gray-600"
            >
              <Truck className="w-3.5 h-3.5" /> Track Order
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 text-xs text-gray-600"
            >
              <HeadphonesIcon className="w-3.5 h-3.5" /> Contact Support
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
