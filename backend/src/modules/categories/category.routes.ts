import { createCrudRoutes } from "../crud/crud.routes.js";
import { categoryController } from "./category.controller.js";

export default createCrudRoutes(
  { path: "categories", publicRead: true },
  categoryController,
);
