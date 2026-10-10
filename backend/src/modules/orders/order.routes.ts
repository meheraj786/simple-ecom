import { Router } from "express";
import { createCrudRoutes } from "../crud/crud.routes.js";
import {
  createOrder,
  getOrderTracking,
  orderCrudController,
} from "./order.controller.js";

const router = Router();

router.post("/", createOrder);
router.post("/track", getOrderTracking);
router.use(createCrudRoutes({ path: "orders" }, orderCrudController));

export default router;
