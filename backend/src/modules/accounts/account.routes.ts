import { createCrudRoutes } from "../crud/crud.routes.js";
import { accountController } from "./account.controller.js";

export default createCrudRoutes({ path: "accounts" }, accountController);
