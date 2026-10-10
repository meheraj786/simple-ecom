import { createCrudService } from "../crud/crud.service.js";

export const subcategoryService = createCrudService("subCategory", {
  path: "subcategories",
  publicRead: true,
});
