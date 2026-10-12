"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Check, LoaderCircle, Send } from "lucide-react";

import { useSubmitContactMessage } from "@/hooks/use-contact-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email: z.email("Enter a valid email address").max(254),
  phone: z
    .string()
    .trim()
    .max(40, "Phone number must be 40 characters or fewer"),
  subject: z
    .string()
    .trim()
    .max(160, "Subject must be 160 characters or fewer"),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

type ContactValues = z.infer<typeof contactSchema>;

export function ContactMessageForm({ className = "" }: { className?: string }) {
  const submission = useSubmitContactMessage();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactValues) {
    setSubmitted(false);
    try {
      await submission.mutateAsync({
        ...values,
        phone: values.phone.trim(),
        subject: values.subject.trim(),
      });
      reset();
      setSubmitted(true);
      toast.success("Your message has been sent");
    } catch (error) {
      const responseMessage =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : null;
      toast.error(
        responseMessage ?? "Could not send your message. Please try again.",
      );
    }
  }

  return (
    <div className={`grid gap-5 ${className}`}>
      <div>
        <h2 className="text-lg font-semibold">Send us a message</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your question and our team will get back to you.
        </p>
      </div>

      {submitted && (
        <div
          role="status"
          className="flex items-start gap-3 border border-emerald-800/20 bg-emerald-50 px-4 py-3 text-sm text-emerald-950"
        >
          <Check className="mt-0.5 size-4 shrink-0" />
          <p>
            <span className="font-semibold">Message received.</span> Our team
            will get back to you soon.
          </p>
        </div>
      )}

      <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contact-name">Name</Label>
            <Input
              id="contact-name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              disabled={submission.isPending}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              disabled={submission.isPending}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-phone">
              Phone{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              disabled={submission.isPending}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-subject">
              Subject{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Input
              id="contact-subject"
              aria-invalid={Boolean(errors.subject)}
              disabled={submission.isPending}
              {...register("subject")}
            />
            {errors.subject && (
              <p className="text-sm text-destructive">
                {errors.subject.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-message">Message</Label>
          <textarea
            id="contact-message"
            rows={5}
            maxLength={5000}
            aria-invalid={Boolean(errors.message)}
            disabled={submission.isPending}
            className="w-full min-w-0 resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive"
            {...register("message")}
          />
          {errors.message && (
            <p className="text-sm text-destructive">{errors.message.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full sm:w-fit"
          disabled={submission.isPending}
        >
          {submission.isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Send />
          )}
          {submission.isPending ? "Sending..." : "Send message"}
        </Button>
      </form>
    </div>
  );
}
