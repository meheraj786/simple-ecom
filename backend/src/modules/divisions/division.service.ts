import { createCrudService } from "../crud/crud.service.js";

export const divisionService = createCrudService("division", {
  path: "divisions",
  publicRead: true,
});
