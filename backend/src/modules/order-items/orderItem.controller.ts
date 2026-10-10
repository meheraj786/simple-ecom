import { createCrudController } from "../crud/crud.controller.js";
import { orderItemService } from "./orderItem.service.js";

export const orderItemController = createCrudController(
  orderItemService,
  "order items",
);
