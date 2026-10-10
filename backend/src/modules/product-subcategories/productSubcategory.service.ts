import { createCrudService } from "../crud/crud.service.js";

export const productSubcategoryService = createCrudService(
  "productSubCategory",
  {
    path: "product-subcategories",
    publicRead: true,
  },
);
