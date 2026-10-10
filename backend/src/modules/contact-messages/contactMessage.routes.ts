import { Router } from "express";
import { createCrudRoutes } from "../crud/crud.routes.js";
import {
  contactMessageCrudController,
  createContactMessageController,
} from "./contactMessage.controller.js";

const router = Router();

router.post("/", createContactMessageController);
router.use(
  createCrudRoutes({ path: "contact-messages" }, contactMessageCrudController),
);

export default router;
