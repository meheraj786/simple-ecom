import { rateLimit } from "express-rate-limit";
import { errorResponse } from "../utils/apiResponse.js";

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    errorResponse(response, 429, "Too many requests. Please try again later.");
  },
});

export const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_request, response) => {
    errorResponse(
      response,
      429,
      "Too many login attempts. Please try again later.",
    );
  },
});
