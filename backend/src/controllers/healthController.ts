import type { Request, Response } from "express";
import { successResponse } from "../utils/apiResponse.js";

export function getHealth(_request: Request, response: Response): void {
  successResponse(response, "Service is healthy", {
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}
