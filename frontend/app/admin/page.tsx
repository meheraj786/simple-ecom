"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  LayoutDashboard,
  LoaderCircle,
  MessageSquareText,
  Package,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import type { DashboardStats } from "@/server/types";

function formatAmount(value: number | string) {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : String(value);
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

function errorMessage(error: unknown) {
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
  return error instanceof Error
    ? error.message
    : "Dashboard data could not be loaded";
}

function StatusSummary({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<{ status: string; count: number }>;
}) {
  const maximum = Math.max(1, ...rows.map(({ count }) => count));

  return (
    <section className="min-w-0 border p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {rows.length ? (
        <div className="grid gap-4">
          {rows
            .toSorted((left, right) => right.count - left.count)
            .map(({ status, count }) => (
              <div key={status} className="grid gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">
                    {status.replaceAll("_", " ")}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {count}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-[width]"
                    style={{ width: `${(count / maximum) * 100}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <p className="py-5 text-sm text-muted-foreground">
          No status data yet.
        </p>
      )}
    </section>
  );
}

function DashboardContent({ data }: { data: DashboardStats }) {
  const metrics = [
    {
      label: "Gross revenue",
      value: formatAmount(data.revenue.allTime),
      detail: "Paid orders, all time",
      icon: ArrowUpRight,
    },
    {
      label: "Revenue · 30 days",
      value: formatAmount(data.revenue.last30Days),
      detail: "Paid orders in the last month",
      icon: ArrowDownRight,
    },
    {
      label: "Orders",
      value: data.totals.orders.toLocaleString(),
      detail: `${data.totals.pendingOrders.toLocaleString()} awaiting fulfillment`,
      icon: ShoppingCart,
    },
    {
      label: "Products",
      value: data.totals.products.toLocaleString(),
      detail: "Across the catalog",
      icon: Package,
    },
    {
      label: "Categories",
      value: data.totals.categories.toLocaleString(),
      detail: "Product categories",
      icon: Tags,
    },
    {
      label: "Customers",
      value: data.totals.users.toLocaleString(),
      detail: "Registered accounts",
      icon: Users,
    },
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="rounded-lg shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div className="grid gap-1">
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
              </div>
              <span className="flex size-9 items-center justify-center border bg-muted/50 text-muted-foreground">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">
              {detail}
            </CardContent>
          </Card>
        ))}
        <Card className="rounded-lg border-amber-300 bg-amber-50/70 shadow-none dark:bg-amber-950/20">
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
            <div className="grid gap-1">
              <CardDescription>Unread messages</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {data.unreadContactMessages.toLocaleString()}
              </CardTitle>
            </div>
            <span className="flex size-9 items-center justify-center border border-amber-300 bg-white/70 text-amber-800 dark:bg-transparent dark:text-amber-300">
              <MessageSquareText className="size-4" />
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 text-amber-900 dark:text-amber-200"
              render={<Link href="/admin/messages" />}
            >
              Open inbox
              <ArrowUpRight />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <StatusSummary
          title="Order status"
          description="Current fulfillment breakdown"
          rows={data.orderStatusCounts}
        />
        <StatusSummary
          title="Product inventory"
          description="Products grouped by inventory status"
          rows={data.productStatusCounts}
        />
      </div>

      <section className="grid gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-medium">Recent orders</h2>
            <p className="text-sm text-muted-foreground">
              Latest {data.recentOrders.items.length} of{" "}
              {data.recentOrders.pagination.total} orders
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/admin/order" />}
          >
            View all orders
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/order/${encodeURIComponent(order.id)}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-36">
                      <p className="font-medium">{order.customerName}</p>
                      <p className="max-w-48 truncate text-xs text-muted-foreground">
                        {order.customerEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order._count.items}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.status.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.paymentStatus === "PAID" ? "secondary" : "outline"
                      }
                    >
                      {order.paymentStatus.replaceAll("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatAmount(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {data.recentOrders.items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No orders yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </>
  );
}

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboard({ page: 1, limit: 8 });

  return (
    <main className="flex flex-col gap-6 p-4 lg:p-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <LayoutDashboard className="size-3.5" />
            Store overview
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A live overview of store activity and fulfillment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<Link href="/admin/messages" />}>
            <MessageSquareText />
            Messages
          </Button>
          <Button render={<Link href="/admin/product" />}>
            <Boxes />
            Manage products
          </Button>
        </div>
      </header>

      {dashboard.isLoading ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 7 }, (_, index) => (
              <Card key={index} className="rounded-lg shadow-none">
                <CardHeader className="gap-3">
                  <div className="flex justify-between">
                    <div className="grid flex-1 gap-2">
                      <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                      <div className="h-7 w-32 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="size-9 animate-pulse rounded bg-muted" />
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading store metrics
          </div>
        </>
      ) : dashboard.isError ? (
        <div
          className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4 text-sm"
          role="alert"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="font-medium">Dashboard data is unavailable</p>
            <p className="mt-1 text-muted-foreground">
              {errorMessage(dashboard.error)}
            </p>
          </div>
        </div>
      ) : dashboard.data ? (
        <DashboardContent data={dashboard.data} />
      ) : null}
    </main>
  );
}
