"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, PackageSearch, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderTrackingApi } from "@/server/resources";
import type { OrderTracking, TrackOrderInput } from "@/server/types";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isPhoneNumber(value: string) {
  return /^[+\d(][\d\s()+.-]{6,}$/.test(value);
}

function OrderResult({
  order,
  featured,
}: {
  order: OrderTracking;
  featured: boolean;
}) {
  return (
    <article
      className={`border p-4 sm:p-5 ${featured ? "border-emerald-800 bg-emerald-50/50" : "border-gray-200 bg-white"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Order ID</p>
          <h2 className="mt-1 break-all font-mono text-sm font-semibold text-gray-950">
            {order.id}
          </h2>
        </div>
        <span className="border border-emerald-800/20 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900">
          {formatStatus(order.status)}
        </span>
      </div>
      <div className="mt-4 grid gap-3 border-t border-gray-200/80 pt-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500">Order placed</p>
          <p className="mt-1 font-medium text-gray-800">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Payment</p>
          <p className="mt-1 font-medium text-gray-800">
            {formatStatus(order.paymentStatus)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="mt-1 font-semibold text-gray-950">
            ৳{Number(order.totalAmount).toLocaleString("en-BD")}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Delivery area: {order.division.name}
      </p>
    </article>
  );
}

export default function OrderTrackPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<OrderTracking[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupMode, setLookupMode] = useState<"phone" | "id" | null>(null);

  async function findOrders(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;

    const byPhone = isPhoneNumber(value);
    const input: TrackOrderInput = byPhone
      ? { customerPhone: value }
      : { orderId: value };
    setLookupMode(byPhone ? "phone" : "id");
    setLoading(true);
    setSearched(true);
    try {
      const results = await orderTrackingApi.find(input);
      setOrders(results);
    } catch (error) {
      setOrders([]);
      toast.error(
        error instanceof Error ? error.message : "Could not find this order",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-[65vh] w-full max-w-4xl px-4 py-10 sm:px-8 sm:py-14">
      <header className="border-b border-gray-200 pb-6">
        <p className="text-xs font-semibold uppercase text-emerald-800">
          Order support
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-950">
          Track your order
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
          Search with the phone number used at checkout to see recent orders, or
          enter an order ID to check one order.
        </p>
      </header>

      <form
        className="mt-7 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={findOrders}
      >
        <div className="grid gap-2">
          <Label htmlFor="order-lookup">Phone number or order ID</Label>
          <Input
            id="order-lookup"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="e.g. 01XXXXXXXXX or your order ID"
            autoComplete="off"
            required
          />
        </div>
        <Button type="submit" disabled={loading || !query.trim()}>
          {loading ? <LoaderCircle className="animate-spin" /> : <Search />}
          Track order
        </Button>
      </form>

      <section className="mt-8" aria-live="polite">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <LoaderCircle className="size-4 animate-spin" />
            Looking up orders...
          </div>
        ) : orders.length ? (
          <div className="space-y-3">
            {lookupMode === "phone" && (
              <p className="mb-4 text-sm text-gray-600">
                {orders.length > 1
                  ? `Your ${orders.length} most recent orders`
                  : "Your most recent order"}
                {orders.length > 0 && " · Latest order shown first"}
              </p>
            )}
            {orders.map((order, index) => (
              <OrderResult
                key={order.id}
                order={order}
                featured={index === 0}
              />
            ))}
          </div>
        ) : searched ? (
          <div className="border border-dashed border-gray-300 px-5 py-12 text-center">
            <PackageSearch className="mx-auto size-8 text-gray-400" />
            <p className="mt-3 font-medium text-gray-800">
              No matching order found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Check the{" "}
              {lookupMode === "phone"
                ? "phone number used at checkout"
                : "order ID"}{" "}
              and try again.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
