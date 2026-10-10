import { createCrudService } from "../crud/crud.service.js";

export const productService = createCrudService("product", {
  path: "products",
  publicRead: true,
  publicWhere: { isActive: true },
  productStatus: true,
});
