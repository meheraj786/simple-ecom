"use client";

import Link from "next/link";
import { Search, User, Heart, ShoppingBag, Truck, HeadphonesIcon, ChevronDown } from "lucide-react";
import Logo from "./Logo";

export default function Navbar() {
  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "#" },
    { name: "New Arrivals", href: "#" },
    { name: "Featured Items", href: "#" },
    { name: "Men", href: "#", hasDropdown: true },
    { name: "Women", href: "#", hasDropdown: true },
    { name: "Fashion Accessories", href: "#", hasDropdown: true },
    { name: "Ethnic & Traditional", href: "#", hasDropdown: true },
  ];

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top Announcement Bar */}
      <div className="bg-[#FAF9F6] border-b border-gray-100 text-[11px] text-gray-500 py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Guest</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="flex items-center gap-1.5 hover:text-black transition">
              <Truck className="w-3.5 h-3.5" />
              <span>Track Order</span>
            </Link>
            <Link href="#" className="flex items-center gap-1.5 hover:text-black transition">
              <HeadphonesIcon className="w-3.5 h-3.5" />
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
    <Logo/>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-6 text-[13px] font-medium text-gray-700">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-1 hover:text-black transition-colors"
            >
              {item.name}
              {item.hasDropdown && <ChevronDown className="w-3 h-3 text-gray-400" />}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center gap-4 text-gray-700">
          <button aria-label="Search" className="p-1.5 hover:text-black transition">
            <Search className="w-4 h-4" />
          </button>
          <button aria-label="Account" className="p-1.5 hover:text-black transition">
            <User className="w-4 h-4" />
          </button>
          <button aria-label="Wishlist" className="p-1.5 hover:text-black transition relative">
            <Heart className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 text-[9px] bg-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>
          <button aria-label="Cart" className="p-1.5 hover:text-black transition relative">
            <ShoppingBag className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 text-[9px] bg-black text-white w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}