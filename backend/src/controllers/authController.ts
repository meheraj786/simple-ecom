import type { RequestHandler } from "express";
import { prisma } from "../db.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import {
  OAUTH_STATE_COOKIE,
  OAUTH_REDIRECT_COOKIE,
  clearAuthCookies,
  createOAuthState,
  getGoogleOAuthClient,
  issueAuthCookies,
  oauthStateCookieOptions,
  resolveAdminRedirectPath,
} from "../utils/auth.js";
import { verifyPassword } from "../utils/password.js";

export const adminPasswordLogin: RequestHandler = async (request, response) => {
  const email =
    typeof request.body?.email === "string"
      ? request.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof request.body?.password === "string" ? request.body.password : "";

  if (!email || !password || email.length > 320 || password.length > 1024) {
    errorResponse(response, 400, "Email and password are required");
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      provider: true,
      avatar: true,
      createdAt: true,
      isRegistered: true,
      password: true,
    },
  });

  if (
    !user ||
    !user.isRegistered ||
    user.role !== "ADMIN" ||
    !user.password ||
    !(await verifyPassword(password, user.password))
  ) {
    errorResponse(response, 401, "Invalid email or password");
    return;
  }

  issueAuthCookies(response, user.id);
  const {
    isRegistered: _isRegistered,
    password: _password,
    ...safeUser
  } = user;
  successResponse(response, "Admin signed in", safeUser);
};

export const startGoogleOAuth: RequestHandler = (request, response) => {
  try {
    const state = createOAuthState();
    response.cookie(OAUTH_STATE_COOKIE, state, oauthStateCookieOptions());
    response.cookie(
      OAUTH_REDIRECT_COOKIE,
      resolveAdminRedirectPath(request.query.redirectTo),
      oauthStateCookieOptions(),
    );

    const url = getGoogleOAuthClient().generateAuthUrl({
      access_type: "online",
      prompt: "select_account",
      scope: ["openid", "email", "profile"],
      state,
    });

    response.redirect(url);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Google OAuth is unavailable";
    errorResponse(response, 503, message);
  }
};

export const finishGoogleOAuth: RequestHandler = async (request, response) => {
  const code = typeof request.query.code === "string" ? request.query.code : "";
  const state =
    typeof request.query.state === "string" ? request.query.state : "";
  const savedState = request.cookies?.[OAUTH_STATE_COOKIE];
  const redirectTo = request.cookies?.[OAUTH_REDIRECT_COOKIE];

  response.clearCookie(OAUTH_STATE_COOKIE, oauthStateCookieOptions());
  response.clearCookie(OAUTH_REDIRECT_COOKIE, oauthStateCookieOptions());

  if (
    !code ||
    !state ||
    typeof savedState !== "string" ||
    state !== savedState
  ) {
    errorResponse(response, 400, "Invalid Google OAuth callback state");
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    errorResponse(response, 503, "Google OAuth is not configured");
    return;
  }

  try {
    const client = getGoogleOAuthClient();
    const { tokens } = await client.getToken(code);

    if (!tokens.id_token) {
      errorResponse(response, 401, "Google did not return a verified identity");
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: clientId,
    });
    const profile = ticket.getPayload();

    if (
      !profile?.sub ||
      !profile.email ||
      profile.email_verified !== true ||
      !profile.name
    ) {
      errorResponse(response, 401, "A verified Google profile is required");
      return;
    }

    const existingUser =
      (await prisma.user.findUnique({ where: { googleId: profile.sub } })) ??
      (await prisma.user.findUnique({ where: { email: profile.email } }));
    const profileData = {
      email: profile.email,
      name: profile.name,
      googleId: profile.sub,
      provider: "google",
      isRegistered: true,
      ...(profile.picture ? { avatar: profile.picture } : {}),
    };
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: profileData,
        })
      : await prisma.user.create({
          data: profileData,
        });

    issueAuthCookies(response, user.id);
    const frontendUrl =
      process.env.FRONTEND_URL ??
      process.env.CLIENT_URL?.split(",")[0]?.trim() ??
      "http://localhost:3000";
    response.redirect(
      `${frontendUrl.replace(/\/$/, "")}${resolveAdminRedirectPath(redirectTo)}`,
    );
  } catch {
    errorResponse(response, 401, "Google authentication failed");
  }
};

export const getCurrentUser: RequestHandler = async (_request, response) => {
  const userId = response.locals.auth?.userId;
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          provider: true,
          avatar: true,
          createdAt: true,
        },
      })
    : null;

  if (!user) {
    errorResponse(response, 401, "Authentication required");
    return;
  }

  successResponse(response, "Current user", user);
};

export const logout: RequestHandler = (_request, response) => {
  clearAuthCookies(response);
  response.clearCookie(OAUTH_STATE_COOKIE, oauthStateCookieOptions());
  successResponse(response, "Logged out");
};
