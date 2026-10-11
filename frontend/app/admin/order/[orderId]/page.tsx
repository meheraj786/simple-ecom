"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, LoaderCircle, PackageCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminOrderDetails, useOrderMutations } from "@/hooks/use-resources";
import type { AdminOrderDetails } from "@/server/types";

const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
const paymentStatuses = ["UNPAID", "PAID", "FAILED", "REFUNDED"] as const;

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "long",
        timeStyle: "short",
      }).format(date);
}

function formatAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : value;
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="grid min-w-0 gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="wrap-break-word text-sm">{value || "-"}</dd>
    </div>
  );
}

function jsonText(value: unknown) {
  if (value === null || value === undefined) return "Not provided";
  try {
    return JSON.stringify(value, null, 2) ?? "Not provided";
  } catch {
    return String(value);
  }
}

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const orderQuery = useAdminOrderDetails(orderId);
  const mutations = useOrderMutations();
  const order = orderQuery.data;

  async function updateOrderField(
    key: "status" | "paymentStatus",
    value: string,
  ) {
    if (!order || !value || value === order[key]) return;
    try {
      await mutations.update.mutateAsync({
        id: order.id,
        data: { [key]: value },
      });
      toast.success(`${key === "status" ? "Order" : "Payment"} status updated`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  if (orderQuery.isLoading) {
    return (
      <main className="flex min-h-72 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Loading order details
      </main>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <main className="flex flex-col gap-4 p-4 lg:p-6">
        <Button
          variant="ghost"
          className="w-fit"
          render={<Link href="/admin/order" />}
        >
          <ArrowLeft />
          Back to orders
        </Button>
        <p role="alert" className="text-sm text-destructive">
          {orderQuery.isError
            ? getErrorMessage(orderQuery.error)
            : "Order not found"}
        </p>
      </main>
    );
  }

  const currentOrder = order as AdminOrderDetails;

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 w-fit"
            render={<Link href="/admin/order" />}
          >
            <ArrowLeft />
            Orders
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Order #{currentOrder.id.slice(-8).toUpperCase()}
            </h1>
            <Badge variant="outline">
              {currentOrder.status.replaceAll("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(currentOrder.createdAt)}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="order-status">Order status</Label>
            <Select
              value={currentOrder.status}
              onValueChange={(value) =>
                void updateOrderField("status", value ?? "")
              }
              disabled={mutations.update.isPending}
              items={[...new Set([currentOrder.status, ...orderStatuses])].map(
                (status) => ({
                  label: status.replaceAll("_", " "),
                  value: status,
                }),
              )}
            >
              <SelectTrigger id="order-status" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[...new Set([currentOrder.status, ...orderStatuses])].map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </SelectItem>
                    ),
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="payment-status">Payment status</Label>
            <Select
              value={currentOrder.paymentStatus}
              onValueChange={(value) =>
                void updateOrderField("paymentStatus", value ?? "")
              }
              disabled={mutations.update.isPending}
              items={[
                ...new Set([currentOrder.paymentStatus, ...paymentStatuses]),
              ].map((status) => ({
                label: status.replaceAll("_", " "),
                value: status,
              }))}
            >
              <SelectTrigger id="payment-status" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[
                    ...new Set([
                      currentOrder.paymentStatus,
                      ...paymentStatuses,
                    ]),
                  ].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {mutations.update.isPending && (
        <p
          className="flex items-center gap-2 text-sm text-muted-foreground"
          role="status"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Saving status
        </p>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 font-medium">
            <PackageCheck className="size-4 text-muted-foreground" />
            Customer and shipping
          </h2>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <DetailField label="Customer" value={currentOrder.customerName} />
            <DetailField label="Customer ID" value={currentOrder.customerId} />
            <DetailField label="Email" value={currentOrder.customerEmail} />
            <DetailField label="Phone" value={currentOrder.customerPhone} />
            <DetailField
              label="Shipping address"
              value={currentOrder.shippingAddress}
            />
            <DetailField label="City" value={currentOrder.city} />
            <DetailField label="Postal code" value={currentOrder.zipCode} />
            <DetailField label="Division" value={currentOrder.division.name} />
            <DetailField
              label="Delivery charge"
              value={formatAmount(String(currentOrder.division.deliveryCharge))}
            />
            <DetailField label="User ID" value={currentOrder.userId} />
          </dl>
        </div>

        <div className="rounded-lg border p-4 sm:p-5">
          <h2 className="mb-4 font-medium">Payment and totals</h2>
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            <DetailField
              label="Payment method"
              value={currentOrder.paymentMethod}
            />
            <DetailField
              label="Payment status"
              value={currentOrder.paymentStatus}
            />
            <DetailField
              label="Transaction ID"
              value={currentOrder.transactionId}
            />
            <DetailField label="Coupon code" value={currentOrder.couponCode} />
            <DetailField
              label="Subtotal / total"
              value={formatAmount(currentOrder.totalAmount)}
            />
            <DetailField
              label="Discount amount"
              value={formatAmount(currentOrder.discountAmount)}
            />
            <DetailField
              label="Created"
              value={formatDate(currentOrder.createdAt)}
            />
            <DetailField
              label="Last updated"
              value={formatDate(currentOrder.updatedAt)}
            />
          </dl>
          <details className="mt-5">
            <summary className="cursor-pointer text-sm font-medium">
              Payment details
            </summary>
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md border bg-muted/30 p-3 text-xs leading-5">
              {jsonText(currentOrder.paymentDetails)}
            </pre>
          </details>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-medium">Items</h2>
          <p className="text-sm text-muted-foreground">
            {currentOrder.items.length} line items
          </p>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Variant</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Line total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrder.items.map((item) => {
                const variantOptions = Array.isArray(item.variant.options)
                  ? item.variant.options
                      .map((option) => `${option.name}: ${option.value}`)
                      .join(", ")
                  : "";
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="min-w-36">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.product.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-32">
                        <p>{item.variant.sku}</p>
                        {variantOptions && (
                          <p className="text-xs text-muted-foreground">
                            {variantOptions}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {item.variantSnapshot &&
                          typeof item.variantSnapshot === "object"
                            ? String(
                                (
                                  item.variantSnapshot as Record<
                                    string,
                                    unknown
                                  >
                                ).productName ?? "",
                              )
                            : ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(item.price)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatAmount(
                        (Number(item.price) * item.quantity).toFixed(2),
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {currentOrder.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-20 text-center text-muted-foreground"
                  >
                    No items on this order.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
