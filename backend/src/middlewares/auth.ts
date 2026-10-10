import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { errorResponse } from "../utils/apiResponse.js";
import {
  AUTH_COOKIE,
  CSRF_COOKIE,
  clearAuthCookies,
  getJwtSecret,
} from "../utils/auth.js";

function sameToken(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export const authenticate: RequestHandler = async (request, response, next) => {
  const token = request.cookies?.[AUTH_COOKIE];

  if (typeof token !== "string") {
    errorResponse(response, 401, "Authentication required");
    return;
  }

  let userId: string;

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    userId = typeof payload === "string" ? "" : (payload.sub ?? "");
  } catch {
    clearAuthCookies(response);
    errorResponse(response, 401, "Invalid or expired session");
    return;
  }

  if (!userId) {
    clearAuthCookies(response);
    errorResponse(response, 401, "Invalid or expired session");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isRegistered: true },
  });

  if (!user || !user.isRegistered) {
    clearAuthCookies(response);
    errorResponse(response, 401, "User account is unavailable");
    return;
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const csrfCookie = request.cookies?.[CSRF_COOKIE];
    const csrfHeader = request.get("x-csrf-token");

    if (
      typeof csrfCookie !== "string" ||
      typeof csrfHeader !== "string" ||
      !sameToken(csrfCookie, csrfHeader)
    ) {
      errorResponse(response, 403, "CSRF token is missing or invalid");
      return;
    }
  }

  response.locals.auth = { userId: user.id, role: user.role };
  next();
};

export const requireAdmin: RequestHandler = (_request, response, next) => {
  if (response.locals.auth?.role !== "ADMIN") {
    errorResponse(response, 403, "Admin access required");
    return;
  }

  next();
};
