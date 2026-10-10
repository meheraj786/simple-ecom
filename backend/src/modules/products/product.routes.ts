import { createCrudRoutes } from "../crud/crud.routes.js";
import { productController } from "./product.controller.js";

export default createCrudRoutes(
  { path: "products", publicRead: true },
  productController,
);
