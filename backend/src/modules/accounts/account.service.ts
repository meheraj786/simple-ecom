import { createCrudService } from "../crud/crud.service.js";

export const accountService = createCrudService("account", {
  path: "accounts",
});
