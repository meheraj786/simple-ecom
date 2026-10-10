import { createCrudController } from "../crud/crud.controller.js";
import { accountService } from "./account.service.js";

export const accountController = createCrudController(
  accountService,
  "accounts",
);
