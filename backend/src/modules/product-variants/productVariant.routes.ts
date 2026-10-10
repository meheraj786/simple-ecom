import { createCrudRoutes } from "../crud/crud.routes.js";
import { productVariantController } from "./productVariant.controller.js";

export default createCrudRoutes(
  { path: "product-variants", publicRead: true },
  productVariantController,
);
