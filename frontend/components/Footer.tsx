"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  const footerLinks = [
    { name: "Home", href: "/" },
    { name: "Shop All", href: "#" },
    { name: "New Arrivals", href: "#" },
    { name: "Featured Items", href: "#" },
    { name: "Men", href: "#" },
    { name: "Women", href: "#" },
    { name: "Fashion Accessories", href: "#" },
    { name: "Ethnic & Traditional", href: "#" },
    { name: "About Our Story", href: "#" },
  ];

  const subLinks = [
    { name: "Contact Support", href: "#" },
    { name: "Customer Dashboard", href: "#" },
    { name: "My Order History", href: "#" },
    { name: "My Wishlist", href: "#" },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 text-center text-gray-600">
      <div className="max-w-4xl mx-auto px-4">
        <Logo />
        <p className="text-xs text-gray-400 mb-6">
          support@van.com | +880 1700-000000
        </p>

        {/* Primary Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium text-gray-700 mb-3">
          {footerLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-black transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Sub Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] text-gray-400 mb-8">
          {subLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="hover:text-black transition"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="max-w-md mx-auto mb-8">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex items-center"
          >
            <input
              type="email"
              placeholder="Enter email for weekly releases"
              className="w-full text-xs bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-10 focus:outline-none focus:border-black transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-7 h-7 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Social Icons */}
        <div className="flex justify-center mb-10">
          <a
            href="#"
            className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition text-xs font-bold"
          >
            f
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-100 pt-6 text-[10px] text-gray-400 tracking-wider">
          © 2024. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
}
