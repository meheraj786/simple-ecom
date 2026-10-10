import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import { createCrudRoutes } from "../crud/crud.routes.js";
import {
  createReviewController,
  deleteReviewController,
  reviewCrudController,
  updateReviewController,
} from "./review.controller.js";

const router = Router();

router.post("/", authenticate, createReviewController);
router.patch("/:id", authenticate, updateReviewController);
router.delete("/:id", authenticate, deleteReviewController);
router.use(
  createCrudRoutes({ path: "reviews", publicRead: true }, reviewCrudController),
);

export default router;
