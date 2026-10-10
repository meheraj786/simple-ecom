import { createCrudRoutes } from "../crud/crud.routes.js";
import { subcategoryController } from "./subcategory.controller.js";

export default createCrudRoutes(
  { path: "subcategories", publicRead: true },
  subcategoryController,
);
