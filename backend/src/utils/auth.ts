import { randomBytes } from "node:crypto";
import type { CookieOptions, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

export const AUTH_COOKIE = "token";
export const CSRF_COOKIE = "csrf_token";
export const OAUTH_STATE_COOKIE = "google_oauth_state";
export const OAUTH_REDIRECT_COOKIE = "google_oauth_redirect";
export const AUTH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export function resolveAdminRedirectPath(value: unknown): string {
  if (typeof value !== "string") {
    return "/";
  }

  try {
    const url = new URL(value, "https://ecom.invalid");
    const isDashboardPath =
      url.pathname === "/admin" ||
      url.pathname.startsWith("/admin/") ||
      url.pathname === "/dashboard" ||
      url.pathname.startsWith("/dashboard/");

    if (url.origin !== "https://ecom.invalid" || !isDashboardPath) {
      return "/";
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function getGoogleOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl =
    process.env.GOOGLE_CALLBACK_URL ??
    "http://localhost:5000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured",
    );
  }

  return new OAuth2Client(clientId, clientSecret, callbackUrl);
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters",
    );
  }

  return secret;
}

export function authCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

export function oauthStateCookieOptions(): CookieOptions {
  return {
    ...authCookieOptions(),
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
  };
}

export function issueAuthCookies(response: Response, userId: string): void {
  const token = jwt.sign({ sub: userId }, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "7d",
  });
  const csrfToken = randomBytes(32).toString("hex");

  response.cookie(AUTH_COOKIE, token, {
    ...authCookieOptions(),
    maxAge: AUTH_TOKEN_MAX_AGE,
  });
  response.cookie(CSRF_COOKIE, csrfToken, {
    ...authCookieOptions(),
    httpOnly: false,
    maxAge: AUTH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(response: Response): void {
  response.clearCookie(AUTH_COOKIE, authCookieOptions());
  response.clearCookie(CSRF_COOKIE, authCookieOptions());
}

export function createOAuthState(): string {
  return randomBytes(32).toString("hex");
}
