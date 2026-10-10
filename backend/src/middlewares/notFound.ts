import type { Request, Response } from "express";
import { errorResponse } from "../utils/apiResponse.js";

export function notFound(request: Request, response: Response): void {
  errorResponse(response, 404, `Route ${request.originalUrl} not found`);
}
