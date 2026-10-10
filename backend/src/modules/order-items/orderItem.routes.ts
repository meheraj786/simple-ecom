import { createCrudRoutes } from "../crud/crud.routes.js";
import { orderItemController } from "./orderItem.controller.js";

export default createCrudRoutes({ path: "order-items" }, orderItemController);
