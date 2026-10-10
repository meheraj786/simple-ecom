import { createCrudService } from "../crud/crud.service.js";

export const productCategoryService = createCrudService("productCategory", {
  path: "product-categories",
  publicRead: true,
});
