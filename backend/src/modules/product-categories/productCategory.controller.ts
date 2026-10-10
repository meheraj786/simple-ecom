import { createCrudController } from "../crud/crud.controller.js";
import { productCategoryService } from "./productCategory.service.js";

export const productCategoryController = createCrudController(
  productCategoryService,
  "product categories",
);
