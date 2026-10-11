import type { RequestHandler } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import { createCrudController } from "../crud/crud.controller.js";
import {
  getAdminOrderDetails as findAdminOrderDetails,
  orderCrudService,
  placeOrder,
  trackOrder,
} from "./order.service.js";

export const orderCrudController = createCrudController(
  orderCrudService,
  "orders",
);

export const createOrder: RequestHandler = async (request, response) => {
  const body = request.body;
  const items = Array.isArray(body?.items) ? body.items : [];

  if (
    typeof body?.customerName !== "string" ||
    !body.customerName.trim() ||
    typeof body.customerEmail !== "string" ||
    !/^\S+@\S+\.\S+$/.test(body.customerEmail) ||
    typeof body.customerPhone !== "string" ||
    !body.customerPhone.trim() ||
    typeof body.shippingAddress !== "string" ||
    !body.shippingAddress.trim() ||
    typeof body.city !== "string" ||
    !body.city.trim() ||
    typeof body.divisionId !== "string" ||
    items.length === 0 ||
    items.length > 50
  ) {
    errorResponse(
      response,
      400,
      "Valid customer, shipping, division, and item details are required",
    );
    return;
  }

  const validItems: Array<{ variantId: string; quantity: number }> = [];
  for (const item of items) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof item.variantId !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 100
    ) {
      errorResponse(
        response,
        400,
        "Each item needs a variantId and quantity from 1 to 100",
      );
      return;
    }
    validItems.push({ variantId: item.variantId, quantity: item.quantity });
  }

  const order = await placeOrder({
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    customerPhone: body.customerPhone,
    shippingAddress: body.shippingAddress,
    city: body.city,
    divisionId: body.divisionId,
    items: validItems,
    ...(typeof body.zipCode === "string" ? { zipCode: body.zipCode } : {}),
  });

  successResponse(response, "Order placed", order, 201);
};

export const getOrderTracking: RequestHandler = async (request, response) => {
  const orderId =
    typeof request.body?.orderId === "string"
      ? request.body.orderId.trim()
      : "";
  const customerPhone =
    typeof request.body?.customerPhone === "string"
      ? request.body.customerPhone.trim()
      : "";

  if (!orderId || !customerPhone) {
    errorResponse(response, 400, "orderId and customerPhone are required");
    return;
  }

  const order = await trackOrder(orderId, customerPhone);
  if (!order) {
    errorResponse(response, 404, "Order not found for the supplied details");
    return;
  }
  successResponse(response, "Order tracking details", order);
};

export const getAdminOrderDetails: RequestHandler = async (
  request,
  response,
) => {
  const id = request.params.id;
  if (typeof id !== "string") {
    errorResponse(response, 400, "A valid order id is required");
    return;
  }

  const order = await findAdminOrderDetails(id);
  if (!order) {
    errorResponse(response, 404, "Order not found");
    return;
  }

  successResponse(response, "Order details", order);
};
