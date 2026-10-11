import { randomUUID } from "node:crypto";
import { prisma } from "../../db.js";
import { createCrudService } from "../crud/crud.service.js";

export const orderCrudService = createCrudService("order", { path: "orders" });

export function getAdminOrderDetails(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      division: {
        select: { id: true, name: true, deliveryCharge: true },
      },
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, baseImage: true },
          },
          variant: {
            select: {
              id: true,
              sku: true,
              price: true,
              compareAtPrice: true,
              images: true,
              options: true,
              isActive: true,
            },
          },
        },
      },
    },
  });
}

export type PlaceOrderInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  zipCode?: string | null;
  divisionId: string;
  items: Array<{ variantId: string; quantity: number }>;
};

export async function placeOrder(input: PlaceOrderInput) {
  const quantities = new Map<string, number>();
  for (const item of input.items) {
    quantities.set(
      item.variantId,
      (quantities.get(item.variantId) ?? 0) + item.quantity,
    );
  }

  const division = await prisma.division.findUnique({
    where: { id: input.divisionId },
  });
  if (!division) {
    throw Object.assign(
      new Error("The selected delivery division does not exist"),
      {
        status: 400,
      },
    );
  }

  const variants = await prisma.productVariant.findMany({
    where: {
      id: { in: [...quantities.keys()] },
      isActive: true,
      product: { isActive: true, status: "IN_STOCK" },
    },
    include: { product: true },
  });
  if (variants.length !== quantities.size) {
    throw Object.assign(
      new Error("One or more selected product variants are unavailable"),
      {
        status: 400,
      },
    );
  }

  const totalCents = variants.reduce(
    (sum, variant) =>
      sum +
      Math.round(variant.price.toNumber() * 100) *
        (quantities.get(variant.id) ?? 0),
    Math.round(division.deliveryCharge.toNumber() * 100),
  );

  return prisma.$transaction((transaction) =>
    transaction.order.create({
      data: {
        customerId: randomUUID(),
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim().toLowerCase(),
        customerPhone: input.customerPhone.trim(),
        shippingAddress: input.shippingAddress.trim(),
        city: input.city.trim(),
        zipCode: input.zipCode?.trim() || null,
        divisionId: division.id,
        totalAmount: (totalCents / 100).toFixed(2),
        paymentMethod: "COD",
        items: {
          create: variants.map((variant) => ({
            productId: variant.productId,
            variantId: variant.id,
            quantity: quantities.get(variant.id) ?? 0,
            price: variant.price,
            variantSnapshot: {
              productName: variant.product.name,
              productSlug: variant.product.slug,
              sku: variant.sku,
              options: variant.options,
            },
          })),
        },
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
      },
    }),
  );
}

export async function trackOrder(orderId: string, customerPhone: string) {
  return prisma.order.findFirst({
    where: { id: orderId, customerPhone },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      createdAt: true,
      updatedAt: true,
      division: { select: { name: true } },
      items: {
        select: { quantity: true, price: true, variantSnapshot: true },
      },
    },
  });
}
