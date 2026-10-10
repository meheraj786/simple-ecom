import { Router } from "express";
import adminDashboardRoutes from "./adminDashboardRoutes.js";
import authRoutes from "./authRoutes.js";
import contactMessageRoutes from "../modules/contact-messages/contactMessage.routes.js";
import healthRoutes from "./healthRoutes.js";
import categoryRoutes from "../modules/categories/category.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import accountRoutes from "../modules/accounts/account.routes.js";
import subcategoryRoutes from "../modules/subcategories/subcategory.routes.js";
import productRoutes from "../modules/products/product.routes.js";
import productVariantRoutes from "../modules/product-variants/productVariant.routes.js";
import productCategoryRoutes from "../modules/product-categories/productCategory.routes.js";
import productSubcategoryRoutes from "../modules/product-subcategories/productSubcategory.routes.js";
import orderItemRoutes from "../modules/order-items/orderItem.routes.js";
import divisionRoutes from "../modules/divisions/division.routes.js";
import orderRoutes from "../modules/orders/order.routes.js";
import reviewRoutes from "../modules/reviews/review.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/admin/dashboard", adminDashboardRoutes);
router.use("/orders", orderRoutes);
router.use("/contact-messages", contactMessageRoutes);
router.use("/reviews", reviewRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRoutes);
router.use("/accounts", accountRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/products", productRoutes);
router.use("/product-variants", productVariantRoutes);
router.use("/product-categories", productCategoryRoutes);
router.use("/product-subcategories", productSubcategoryRoutes);
router.use("/order-items", orderItemRoutes);
router.use("/divisions", divisionRoutes);

export default router;
