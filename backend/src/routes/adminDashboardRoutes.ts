import { Router } from "express";
import { prisma } from "../db.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";
import { successResponse } from "../utils/apiResponse.js";

const router = Router();

router.get("/", authenticate, requireAdmin, async (_request, response) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    users,
    products,
    categories,
    orders,
    pendingOrders,
    allTimeRevenue,
    recentRevenue,
    orderStatusCounts,
    productStatusCounts,
    recentOrders,
    unreadContactMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      where: { paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: thirtyDaysAgo }, paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.contactMessage.count({ where: { isRead: false } }),
  ]);

  successResponse(response, "Admin dashboard statistics", {
    totals: { users, products, categories, orders, pendingOrders },
    revenue: {
      allTime: allTimeRevenue._sum.totalAmount ?? 0,
      last30Days: recentRevenue._sum.totalAmount ?? 0,
    },
    orderStatusCounts: orderStatusCounts.map(({ status, _count }) => ({
      status,
      count: _count._all,
    })),
    productStatusCounts: productStatusCounts.map(({ status, _count }) => ({
      status,
      count: _count._all,
    })),
    unreadContactMessages,
    recentOrders,
  });
});

export default router;
