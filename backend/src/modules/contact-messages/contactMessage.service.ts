import { prisma } from "../../db.js";
import { createCrudService } from "../crud/crud.service.js";

export const contactMessageCrudService = createCrudService("contactMessage", {
  path: "contact-messages",
});

export type CreateContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function createContactMessage(input: CreateContactMessageInput) {
  return prisma.contactMessage.create({
    data: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
    },
    select: { id: true },
  });
}
