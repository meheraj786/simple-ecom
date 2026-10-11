"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

const money = (value: number) => `৳${value.toLocaleString("en-BD")}`;

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col items-center justify-center px-5 text-center">
        <ShoppingBag className="h-10 w-10 text-gray-300" />
        <h1 className="mt-5 text-2xl font-semibold text-gray-950">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Find something you love and it will be here.
        </p>
        <Link
          href="/shop"
          className="mt-6 bg-gray-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gray-800"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
            Your selection
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-950">
            Shopping cart
          </h1>
        </div>
        <Link
          href="/shop"
          className="text-xs text-gray-600 underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <article
              key={item.variantId}
              className="flex gap-4 py-5 first:pt-0"
            >
              <Link
                href={`/shop/${item.productId}`}
                className="relative aspect-4/5 w-24 shrink-0 bg-gray-100 sm:w-32"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 grid place-items-center text-gray-400">
                    <ShoppingBag className="h-6 w-6" />
                  </span>
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:justify-between sm:gap-6">
                <div>
                  <Link
                    href={`/shop/${item.productId}`}
                    className="text-sm font-medium text-gray-900 hover:underline"
                  >
                    {item.productName}
                  </Link>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {item.options
                      .map((option) => `${option.name}: ${option.value}`)
                      .join(" · ")}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-400">
                    SKU {item.sku}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-gray-900">
                    {money(Number(item.unitPrice))}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 sm:mt-0 sm:items-start">
                  <div className="flex h-9 items-center border border-gray-200">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.productName} quantity`}
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity - 1)
                      }
                      className="grid h-8 w-8 place-items-center text-gray-600 hover:text-black"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.productName} quantity`}
                      onClick={() =>
                        setQuantity(item.variantId, item.quantity + 1)
                      }
                      className="grid h-8 w-8 place-items-center text-gray-600 hover:text-black"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${item.productName}`}
                    onClick={() => removeItem(item.variantId)}
                    className="p-2 text-gray-400 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="h-fit border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
          <div className="mt-5 flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-gray-500">
            Delivery is calculated at checkout. Final total is confirmed by the
            server.
          </p>
          <Link
            href="/checkout"
            className="mt-6 flex h-11 items-center justify-center bg-gray-950 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gray-800"
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}
