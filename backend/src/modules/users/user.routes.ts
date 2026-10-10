import { createCrudRoutes } from "../crud/crud.routes.js";
import { userController } from "./user.controller.js";

export default createCrudRoutes({ path: "users" }, userController);
