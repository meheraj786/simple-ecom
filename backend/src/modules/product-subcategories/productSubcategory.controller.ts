import { createCrudController } from "../crud/crud.controller.js";
import { productSubcategoryService } from "./productSubcategory.service.js";

export const productSubcategoryController = createCrudController(
  productSubcategoryService,
  "product subcategories",
);
