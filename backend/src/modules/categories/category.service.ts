import { createCrudService } from "../crud/crud.service.js";

export const categoryService = createCrudService("category", {
  path: "categories",
  publicRead: true,
});
