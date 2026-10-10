import { createCrudRoutes } from "../crud/crud.routes.js";
import { productCategoryController } from "./productCategory.controller.js";

export default createCrudRoutes(
  { path: "product-categories", publicRead: true },
  productCategoryController,
);
