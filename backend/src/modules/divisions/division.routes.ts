import { createCrudRoutes } from "../crud/crud.routes.js";
import { divisionController } from "./division.controller.js";

export default createCrudRoutes(
  { path: "divisions", publicRead: true },
  divisionController,
);
