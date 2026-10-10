import { createCrudService } from "../crud/crud.service.js";

export const userService = createCrudService("user", {
  path: "users",
  hidePassword: true,
});
