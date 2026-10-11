import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import { createCrudRoutes } from "../crud/crud.routes.js";
import {
  createOrder,
  getAdminOrderDetails,
  getOrderTracking,
  orderCrudController,
} from "./order.controller.js";

const router = Router();

router.post("/", createOrder);
router.post("/track", getOrderTracking);
router.get("/:id/details", authenticate, requireAdmin, getAdminOrderDetails);
router.use(createCrudRoutes({ path: "orders" }, orderCrudController));

export default router;
