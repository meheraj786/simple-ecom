import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import { createCrudRoutes } from "../crud/crud.routes.js";
import {
  createAdminProductController,
  getAdminProductController,
  listAdminProductsController,
  productController,
  updateAdminProductController,
} from "./product.controller.js";

const router = Router();

router.get("/admin", authenticate, requireAdmin, listAdminProductsController);
router.get("/admin/:id", authenticate, requireAdmin, getAdminProductController);
router.post("/admin", authenticate, requireAdmin, createAdminProductController);
router.patch(
  "/admin/:id",
  authenticate,
  requireAdmin,
  updateAdminProductController,
);
router.use(
  createCrudRoutes({ path: "products", publicRead: true }, productController),
);

export default router;
