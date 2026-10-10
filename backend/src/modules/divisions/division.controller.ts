import { createCrudController } from "../crud/crud.controller.js";
import { divisionService } from "./division.service.js";

export const divisionController = createCrudController(
  divisionService,
  "divisions",
);
