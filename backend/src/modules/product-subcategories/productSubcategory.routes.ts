import { createCrudRoutes } from "../crud/crud.routes.js";
import { productSubcategoryController } from "./productSubcategory.controller.js";

export default createCrudRoutes(
  { path: "product-subcategories", publicRead: true },
  productSubcategoryController,
);
