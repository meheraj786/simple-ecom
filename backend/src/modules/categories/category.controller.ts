import { createCrudController } from "../crud/crud.controller.js";
import { categoryService } from "./category.service.js";

export const categoryController = createCrudController(
  categoryService,
  "categories",
);
