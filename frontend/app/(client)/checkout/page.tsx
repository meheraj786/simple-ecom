"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { CheckCircle2, ChevronLeft, LoaderCircle } from "lucide-react";
import { useDivisions } from "@/hooks/use-resources";
import { usePlaceOrder } from "@/hooks/use-orders";
import { useCartStore } from "@/lib/cart-store";

const money = (value: number) => `৳${value.toLocaleString("en-BD")}`;

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const divisionsQuery = useDivisions({ page: 1, limit: 100 });
  const placeOrder = usePlaceOrder();
  const [orderId, setOrderId] = useState<string>();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [divisionId, setDivisionId] = useState("");

  const selectedDivision = divisionsQuery.data?.items.find(
    (division) => division.id === divisionId,
  );
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.unitPrice) * item.quantity,
    0,
  );
  const deliveryCharge = Number(selectedDivision?.deliveryCharge ?? 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) return;

    try {
      const order = await placeOrder.mutateAsync({
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        city,
        ...(zipCode ? { zipCode } : {}),
        divisionId,
        items: items.map(({ variantId, quantity }) => ({
          variantId,
          quantity,
        })),
      });
      setOrderId(order.id);
      clearCart();
    } catch {
      // The mutation error is shown below; keep the cart intact for retry.
    }
  }

  if (orderId) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-700" />
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
          Order confirmed
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          Thank you for your order.
        </h1>
        <p className="mt-3 text-sm text-gray-600">
          Your order number is{" "}
          <span className="font-semibold text-gray-900">{orderId}</span>.
        </p>
        <Link
          href="/shop"
          className="mt-7 bg-gray-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gray-800"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl font-semibold text-gray-950">
          Nothing to check out
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Add a product to your cart first.
        </p>
        <Link
          href="/shop"
          className="mt-6 bg-gray-950 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white"
        >
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <Link
        href="/cart"
        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-black"
      >
        <ChevronLeft className="h-4 w-4" /> Back to cart
      </Link>
      <div className="mt-5 border-b border-gray-200 pb-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
          Secure checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          Delivery details
        </h1>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-7">
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Contact</h2>
            <label className="block text-xs text-gray-600">
              Full name
              <input
                required
                autoComplete="name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-1.5 h-11 w-full border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-gray-700"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs text-gray-600">
                Email
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="mt-1.5 h-11 w-full border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-gray-700"
                />
              </label>
              <label className="block text-xs text-gray-600">
                Phone
                <input
                  required
                  type="tel"
                  autoComplete="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="mt-1.5 h-11 w-full border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-gray-700"
                />
              </label>
            </div>
          </section>

          <section className="space-y-4 border-t border-gray-200 pt-6">
            <h2 className="text-sm font-semibold text-gray-900">
              Shipping address
            </h2>
            <label className="block text-xs text-gray-600">
              Street address
              <input
                required
                autoComplete="street-address"
                value={shippingAddress}
                onChange={(event) => setShippingAddress(event.target.value)}
                className="mt-1.5 h-11 w-full border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-gray-700"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-xs text-gray-600 sm:col-span-1">
                City
                <input
                  required
                  autoComplete="address-level2"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  className="mt-1.5 h-11 w-full border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-gray-700"
                />
              </label>
              <label className="block text-xs text-gray-600 sm:col-span-1">
                Division
                <select
                  required
                  value={divisionId}
                  onChange={(event) => setDivisionId(event.target.value)}
                  disabled={divisionsQuery.isPending}
                  className="mt-1.5 h-11 w-full border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-700 disabled:bg-gray-50"
                >
                  <option value="">Select division</option>
                  {divisionsQuery.data?.items.map((division) => (
                    <option key={division.id} value={division.id}>
                      {division.name} · {money(Number(division.deliveryCharge))}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs text-gray-600 sm:col-span-1">
                Postal code
                <input
                  autoComplete="postal-code"
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  className="mt-1.5 h-11 w-full border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-gray-700"
                />
              </label>
            </div>
            {divisionsQuery.isError && (
              <p className="text-xs text-red-700">
                Delivery areas could not be loaded.
              </p>
            )}
          </section>

          {placeOrder.isError && (
            <p
              role="alert"
              className="border border-red-200 bg-red-50 p-3 text-xs text-red-800"
            >
              {(
                placeOrder.error as {
                  response?: { data?: { message?: string } };
                }
              ).response?.data?.message ??
                "Order could not be completed. Your cart is unchanged; please retry."}
            </p>
          )}

          <button
            type="submit"
            disabled={
              placeOrder.isPending ||
              divisionsQuery.isPending ||
              divisionsQuery.isError
            }
            className="flex h-12 w-full items-center justify-center gap-2 bg-gray-950 text-xs font-semibold uppercase tracking-wider text-white hover:bg-gray-800 disabled:cursor-wait disabled:bg-gray-400 sm:w-auto sm:px-10"
          >
            {placeOrder.isPending && (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            )}
            Place cash-on-delivery order
          </button>
        </form>

        <aside className="h-fit border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
          <div className="mt-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="flex justify-between gap-4 text-xs"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {item.options.map((option) => option.value).join(" / ")} ·
                    Qty {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-gray-700">
                  {money(Number(item.unitPrice) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>
                {selectedDivision ? money(deliveryCharge) : "Select area"}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-semibold text-gray-950">
              <span>Estimated total</span>
              <span>{money(subtotal + deliveryCharge)}</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] leading-5 text-gray-500">
            The server rechecks availability and calculates the final order
            total.
          </p>
        </aside>
      </div>
    </main>
  );
}
