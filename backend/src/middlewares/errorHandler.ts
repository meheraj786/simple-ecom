import type { ErrorRequestHandler } from "express";
import { errorResponse } from "../utils/apiResponse.js";

const prismaErrorResponses: Record<
  string,
  { status: number; message: string }
> = {
  P2002: { status: 409, message: "A record with this value already exists" },
  P2003: { status: 400, message: "A related record is invalid" },
  P2025: { status: 404, message: "Record not found" },
};

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next,
) => {
  const prismaCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : undefined;
  const prismaResponse = prismaCode
    ? prismaErrorResponses[prismaCode]
    : undefined;
  const explicitStatus =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : undefined;
  const statusCode = prismaResponse?.status ?? explicitStatus ?? 500;
  const message =
    prismaResponse?.message ??
    (statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : error instanceof Error
        ? error.message
        : "Internal server error");

  errorResponse(response, statusCode, message);
};
