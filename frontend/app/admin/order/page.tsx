"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  ArrowDownToLine,
  Eye,
  LoaderCircle,
  Pencil,
  Printer,
  Trash2,
} from "lucide-react";

import {
  ServerDataTable,
  type ServerDataTableColumn,
} from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderMutations, useOrders } from "@/hooks/use-resources";
import { adminOrderDetailsApi, ordersApi } from "@/server/resources";
import type { AdminOrderDetails, Order } from "@/server/types";

const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

const orderEditSchema = z.object({
  customerName: z.string().trim().min(2, "Enter the customer's name").max(120),
  customerEmail: z.email("Enter a valid email address").max(254),
  customerPhone: z.string().trim().min(6, "Enter a valid phone number").max(32),
  shippingAddress: z
    .string()
    .trim()
    .min(5, "Enter the shipping address")
    .max(500),
  city: z.string().trim().min(2, "Enter the city").max(100),
  zipCode: z
    .string()
    .trim()
    .max(20, "Postal code must be 20 characters or fewer"),
});

type OrderEditValues = z.infer<typeof orderEditSchema>;

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
        dateStyle: "medium",
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

async function fetchAllOrders() {
  const firstPage = await ordersApi.list({ page: 1, limit: 100 });
  if (firstPage.pagination.pages <= 1) return firstPage.items;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.pagination.pages - 1 }, (_, index) =>
      ordersApi.list({ page: index + 2, limit: 100 }),
    ),
  );
  return firstPage.items.concat(...remainingPages.map((page) => page.items));
}

function OrderEditDialog({
  open,
  order,
  saving,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  order: Order | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: OrderEditValues) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderEditValues>({
    resolver: zodResolver(orderEditSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      zipCode: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        order
          ? {
              customerName: order.customerName,
              customerEmail: order.customerEmail,
              customerPhone: order.customerPhone,
              shippingAddress: order.shippingAddress,
              city: order.city,
              zipCode: order.zipCode ?? "",
            }
          : undefined,
      );
    }
  }, [open, order, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit order details</DialogTitle>
          <DialogDescription>
            Update the customer contact and shipping information.
          </DialogDescription>
        </DialogHeader>
        <form
          id="order-edit-form"
          className="grid gap-4"
          onSubmit={handleSubmit(onSave)}
          noValidate
        >
          <div className="grid gap-2">
            <Label htmlFor="order-customer-name">Customer name</Label>
            <Input
              id="order-customer-name"
              aria-invalid={Boolean(errors.customerName)}
              {...register("customerName")}
            />
            {errors.customerName && (
              <p className="text-sm text-destructive">
                {errors.customerName.message}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="order-customer-email">Email</Label>
              <Input
                id="order-customer-email"
                type="email"
                aria-invalid={Boolean(errors.customerEmail)}
                {...register("customerEmail")}
              />
              {errors.customerEmail && (
                <p className="text-sm text-destructive">
                  {errors.customerEmail.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-customer-phone">Phone</Label>
              <Input
                id="order-customer-phone"
                type="tel"
                aria-invalid={Boolean(errors.customerPhone)}
                {...register("customerPhone")}
              />
              {errors.customerPhone && (
                <p className="text-sm text-destructive">
                  {errors.customerPhone.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="order-shipping-address">Shipping address</Label>
            <Input
              id="order-shipping-address"
              aria-invalid={Boolean(errors.shippingAddress)}
              {...register("shippingAddress")}
            />
            {errors.shippingAddress && (
              <p className="text-sm text-destructive">
                {errors.shippingAddress.message}
              </p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="order-city">City</Label>
              <Input
                id="order-city"
                aria-invalid={Boolean(errors.city)}
                {...register("city")}
              />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="order-zip-code">Postal code</Label>
              <Input id="order-zip-code" {...register("zipCode")} />
              {errors.zipCode && (
                <p className="text-sm text-destructive">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button type="button" variant="outline" disabled={saving} />
            }
          >
            Cancel
          </DialogClose>
          <Button type="submit" form="order-edit-form" disabled={saving}>
            {saving && <LoaderCircle className="animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [exporting, setExporting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrderDetails | null>(
    null,
  );
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);

  const ordersQuery = useOrders({ page, limit });
  const mutations = useOrderMutations();
  const orders = ordersQuery.data?.items ?? [];
  const pagination = {
    page,
    limit,
    total: ordersQuery.data?.pagination.total ?? 0,
    pages: ordersQuery.data?.pagination.pages ?? 0,
  };

  async function updateStatus(order: Order, status: string) {
    if (!status || status === order.status) return;
    setUpdatingStatusId(order.id);
    try {
      await mutations.update.mutateAsync({
        id: order.id,
        data: { status },
      });
      toast.success(`Order status changed to ${status.toLowerCase()}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function previewInvoice(order: Order) {
    setInvoiceLoadingId(order.id);
    try {
      setInvoiceOrder(await adminOrderDetailsApi.get(order.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setInvoiceLoadingId(null);
    }
  }

  function printInvoice() {
    document.body.classList.add("invoice-print-mode");
    const cleanup = () => document.body.classList.remove("invoice-print-mode");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  }

  const columns: ServerDataTableColumn<Order>[] = [
    {
      id: "order",
      header: "Order",
      cell: (order) => (
        <div className="min-w-36">
          <Link
            href={`/admin/order/${encodeURIComponent(order.id)}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            #{order.id.slice(-8).toUpperCase()}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: (order) => (
        <div className="min-w-36">
          <p className="font-medium">{order.customerName}</p>
          <p
            className="max-w-44 truncate text-xs text-muted-foreground"
            title={order.customerEmail}
          >
            {order.customerEmail}
          </p>
        </div>
      ),
    },
    {
      id: "total",
      header: "Total",
      cell: (order) => (
        <span className="font-medium">{formatAmount(order.totalAmount)}</span>
      ),
    },
    {
      id: "status",
      header: "Order status",
      cell: (order) => {
        const statuses = orderStatuses.includes(
          order.status as (typeof orderStatuses)[number],
        )
          ? [...orderStatuses]
          : [order.status, ...orderStatuses];
        return (
          <Select
            value={order.status}
            onValueChange={(value) => void updateStatus(order, value ?? "")}
            disabled={updatingStatusId === order.id}
            items={statuses.map((status) => ({
              label: status.replaceAll("_", " "),
              value: status,
            }))}
          >
            <SelectTrigger size="sm" className="w-36">
              {updatingStatusId === order.id ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <SelectValue />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "payment",
      header: "Payment",
      cell: (order) => (
        <div className="grid gap-1">
          <Badge variant="outline">
            {order.paymentStatus.replaceAll("_", " ")}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {order.paymentMethod.replaceAll("_", " ")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-36 text-right",
      cell: (order) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Preview invoice for order ${order.id}`}
            disabled={invoiceLoadingId === order.id}
            onClick={() => void previewInvoice(order)}
          >
            {invoiceLoadingId === order.id ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <Printer />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`View order ${order.id}`}
            render={
              <Link href={`/admin/order/${encodeURIComponent(order.id)}`} />
            }
          >
            <Eye />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit order ${order.id}`}
            onClick={() => setEditingOrder(order)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:text-destructive"
            aria-label={`Delete order ${order.id}`}
            onClick={() => setDeleteTarget(order)}
          >
            <Trash2 />
          </Button>
        </div>
      ),
    },
  ];

  async function saveOrder(values: OrderEditValues) {
    if (!editingOrder) return;
    try {
      await mutations.update.mutateAsync({
        id: editingOrder.id,
        data: {
          ...values,
          zipCode: values.zipCode || null,
        },
      });
      setEditingOrder(null);
      toast.success("Order details updated");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function deleteOrder() {
    if (!deleteTarget) return;
    try {
      await mutations.remove.mutateAsync(deleteTarget.id);
      if (orders.length === 1 && page > 1)
        setPage((currentPage) => currentPage - 1);
      setDeleteTarget(null);
      toast.success("Order deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function exportOrders() {
    setExporting(true);
    try {
      const [XLSX, records] = await Promise.all([
        import("xlsx"),
        fetchAllOrders(),
      ]);
      const worksheet = XLSX.utils.json_to_sheet(
        records.map((order) => ({
          ID: order.id,
          "Customer Name": order.customerName,
          Email: order.customerEmail,
          Phone: order.customerPhone,
          "Shipping Address": order.shippingAddress,
          City: order.city,
          "Postal Code": order.zipCode ?? "",
          "Total Amount": order.totalAmount,
          "Discount Amount": order.discountAmount,
          "Coupon Code": order.couponCode ?? "",
          Status: order.status,
          "Payment Status": order.paymentStatus,
          "Payment Method": order.paymentMethod,
          "Transaction ID": order.transactionId ?? "",
          "Division ID": order.divisionId,
          "Created At": order.createdAt,
          "Updated At": order.updatedAt,
        })),
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      XLSX.writeFile(workbook, "orders.xlsx");
      toast.success("Orders exported to Excel");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review orders, update fulfillment, and manage customer details.
          </p>
        </div>
        <Button variant="outline" onClick={exportOrders} disabled={exporting}>
          {exporting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <ArrowDownToLine />
          )}
          Export Excel
        </Button>
      </header>

      <div>
        <h2 className="font-medium">Order list</h2>
        <p className="text-sm text-muted-foreground">
          {pagination.total} total orders
        </p>
      </div>

      {ordersQuery.isError && (
        <p role="alert" className="text-sm text-destructive">
          {getErrorMessage(ordersQuery.error)}
        </p>
      )}

      <ServerDataTable
        data={orders}
        columns={columns}
        pagination={pagination}
        loading={ordersQuery.isLoading}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        emptyMessage="No orders found."
      />

      <OrderEditDialog
        open={editingOrder !== null}
        order={editingOrder}
        saving={mutations.update.isPending}
        onOpenChange={(open) => {
          if (!open) setEditingOrder(null);
        }}
        onSave={saveOrder}
      />

      <Dialog
        open={invoiceOrder !== null}
        onOpenChange={(open) => {
          if (!open) setInvoiceOrder(null);
        }}
      >
        <DialogContent className="max-h-[95vh] max-w-[calc(100%-1rem)] overflow-y-auto p-0 sm:max-w-4xl">
          {invoiceOrder && (
            <>
              <div
                id="invoice-print-root"
                className="invoice-paper mx-auto w-full max-w-[210mm] bg-white p-5 text-gray-950 sm:p-10"
              >
                <header className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-gray-900 pb-6">
                  <div className="grid gap-2">
                    <Logo />
                    <p className="text-xs text-gray-500">
                      Official order invoice
                    </p>
                    <p className="text-xs leading-5 text-gray-500">
                      support@store.com
                      <br />
                      +880 1700-000000 · Dhaka, Bangladesh
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-semibold tracking-tight">
                      INVOICE
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      #{invoiceOrder.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDate(invoiceOrder.createdAt)}
                    </p>
                  </div>
                </header>

                <section className="grid gap-6 border-b border-gray-200 py-6 sm:grid-cols-2">
                  <div className="grid content-start gap-2">
                    <h2 className="text-xs font-semibold uppercase text-gray-500">
                      Billed to
                    </h2>
                    <p className="font-semibold">{invoiceOrder.customerName}</p>
                    <p className="text-sm text-gray-700">
                      {invoiceOrder.customerEmail}
                    </p>
                    <p className="text-sm text-gray-700">
                      {invoiceOrder.customerPhone}
                    </p>
                  </div>
                  <div className="grid content-start gap-2 sm:justify-items-end sm:text-right">
                    <h2 className="text-xs font-semibold uppercase text-gray-500">
                      Ship to
                    </h2>
                    <p className="max-w-sm text-sm leading-6 text-gray-800">
                      {invoiceOrder.shippingAddress}
                      <br />
                      {invoiceOrder.city}
                      {invoiceOrder.zipCode ? `, ${invoiceOrder.zipCode}` : ""}
                      <br />
                      {invoiceOrder.division.name}
                    </p>
                  </div>
                </section>

                <div className="overflow-x-auto py-6">
                  <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-300 text-xs uppercase text-gray-500">
                        <th className="py-3 pr-3 font-semibold">Item</th>
                        <th className="px-3 py-3 text-right font-semibold">
                          Qty
                        </th>
                        <th className="px-3 py-3 text-right font-semibold">
                          Unit price
                        </th>
                        <th className="py-3 pl-3 text-right font-semibold">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceOrder.items.map((item) => {
                        const lineTotal = Number(item.price) * item.quantity;
                        const options = item.variant.options
                          .map((option) => `${option.name}: ${option.value}`)
                          .join(" · ");
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 align-top"
                          >
                            <td className="py-4 pr-3">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                SKU: {item.variant.sku}
                              </p>
                              {options && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {options}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-4 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-4 text-right">
                              ৳{formatAmount(item.price)}
                            </td>
                            <td className="py-4 pl-3 text-right font-medium">
                              ৳{formatAmount(lineTotal.toFixed(2))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <section className="ml-auto grid w-full max-w-sm gap-3 border-t border-gray-200 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span>
                      ৳
                      {formatAmount(
                        invoiceOrder.items
                          .reduce(
                            (sum, item) =>
                              sum + Number(item.price) * item.quantity,
                            0,
                          )
                          .toFixed(2),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Delivery charge</span>
                    <span>
                      ৳
                      {formatAmount(
                        String(invoiceOrder.division.deliveryCharge),
                      )}
                    </span>
                  </div>
                  {Number(invoiceOrder.discountAmount) > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">
                        Discount
                        {invoiceOrder.couponCode
                          ? ` (${invoiceOrder.couponCode})`
                          : ""}
                      </span>
                      <span>-৳{formatAmount(invoiceOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between gap-4 border-t border-gray-900 pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span>৳{formatAmount(invoiceOrder.totalAmount)}</span>
                  </div>
                </section>

                <footer className="mt-8 flex flex-wrap justify-between gap-3 border-t border-gray-200 pt-4 text-xs text-gray-500">
                  <span>
                    Payment: {invoiceOrder.paymentMethod.replaceAll("_", " ")} ·{" "}
                    {invoiceOrder.paymentStatus.replaceAll("_", " ")}
                  </span>
                  <span>
                    Order status: {invoiceOrder.status.replaceAll("_", " ")}
                  </span>
                </footer>
              </div>
              <DialogFooter className="invoice-dialog-footer">
                <DialogClose
                  render={<Button type="button" variant="outline" />}
                >
                  Close
                </DialogClose>
                <Button type="button" onClick={printInvoice}>
                  <Printer />
                  Print invoice
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete order?</DialogTitle>
            <DialogDescription>
              Order #{deleteTarget?.id.slice(-8).toUpperCase()} and its items
              will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutations.remove.isPending}
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              variant="destructive"
              onClick={deleteOrder}
              disabled={mutations.remove.isPending}
            >
              {mutations.remove.isPending && (
                <LoaderCircle className="animate-spin" />
              )}
              Delete order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
