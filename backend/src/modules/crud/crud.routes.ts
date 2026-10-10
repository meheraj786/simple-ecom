import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.js";
import type { CrudConfig, CrudController } from "./crud.types.js";

export function createCrudRoutes(
  config: CrudConfig,
  controller: CrudController,
): Router {
  const router = Router();
  const readGuards = config.publicRead ? [] : [authenticate, requireAdmin];

  router.get("/", ...readGuards, controller.list);
  router.get("/:id", ...readGuards, controller.getById);
  router.post("/", authenticate, requireAdmin, controller.create);
  router.patch("/:id", authenticate, requireAdmin, controller.update);
  router.put("/:id", authenticate, requireAdmin, controller.update);
  router.delete("/:id", authenticate, requireAdmin, controller.delete);

  return router;
}
