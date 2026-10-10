import type { RequestHandler } from "express";
import { errorResponse, successResponse } from "../../utils/apiResponse.js";
import { createCrudController } from "../crud/crud.controller.js";
import {
  contactMessageCrudService,
  createContactMessage,
} from "./contactMessage.service.js";

export const contactMessageCrudController = createCrudController(
  contactMessageCrudService,
  "contact messages",
);

export const createContactMessageController: RequestHandler = async (
  request,
  response,
) => {
  const { name, email, phone, subject, message } = request.body ?? {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    typeof message !== "string" ||
    !message.trim()
  ) {
    errorResponse(response, 400, "Valid name, email, and message are required");
    return;
  }

  const created = await createContactMessage({
    name,
    email,
    phone: typeof phone === "string" ? phone : "",
    subject: typeof subject === "string" ? subject : "",
    message,
  });
  successResponse(response, "Message received", created, 201);
};
