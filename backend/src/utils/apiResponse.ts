import type { Response } from "express";

export function successResponse<T>(
  response: Response,
  message: string,
  data?: T,
  statusCode = 200,
): void {
  response.status(statusCode).json({
    success: true,
    message,
    ...(data === undefined ? {} : { data }),
  });
}

export function errorResponse(
  response: Response,
  statusCode: number,
  message: string,
): void {
  response.status(statusCode).json({
    success: false,
    message,
  });
}
