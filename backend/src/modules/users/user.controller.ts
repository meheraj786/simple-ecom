import { createCrudController } from "../crud/crud.controller.js";
import { userService } from "./user.service.js";

export const userController = createCrudController(userService, "users");
