import { createCrudController } from "../crud/crud.controller.js";
import { productService } from "./product.service.js";

export const productController = createCrudController(
  productService,
  "products",
);
