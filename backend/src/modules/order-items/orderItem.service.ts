import { createCrudService } from "../crud/crud.service.js";

export const orderItemService = createCrudService("orderItem", {
  path: "order-items",
});
