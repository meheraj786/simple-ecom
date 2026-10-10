import { createCrudController } from "../crud/crud.controller.js";
import { subcategoryService } from "./subcategory.service.js";

export const subcategoryController = createCrudController(
  subcategoryService,
  "subcategories",
);
