import { createCrudController } from "../crud/crud.controller.js";
import { productVariantService } from "./productVariant.service.js";

export const productVariantController = createCrudController(
  productVariantService,
  "product variants",
);
