"use client";

import { useMutation } from "@tanstack/react-query";
import {
  submitContactMessage,
  type ContactMessageSubmission,
} from "@/server/resources";

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (input: ContactMessageSubmission) =>
      submitContactMessage(input),
  });
}

export {
  useContactMessage,
  useContactMessages,
  useContactMessageMutations,
} from "./use-resources";
