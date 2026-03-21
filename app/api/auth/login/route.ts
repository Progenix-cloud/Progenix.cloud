import { getAuthConfig, login } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { apiError, apiSuccess, validateBody } from "@/lib/api-utils";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const loginAttempts = new Map<
  string,
  { count: number; lastAttempt: number }
>();

function getClientKey(req: NextRequest, email?: string) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${email || "unknown"}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (now - entry.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordAttempt(key: string, success: boolean) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) {
    loginAttempts.set(key, { count: success ? 0 : 1, lastAttempt: now });
    return;
  }
  if (now - entry.lastAttempt > RATE_LIMIT_WINDOW_MS) {
    loginAttempts.set(key, { count: success ? 0 : 1, lastAttempt: now });
    return;
  }
  if (success) {
    loginAttempts.set(key, { count: 0, lastAttempt: now });
  } else {
    loginAttempts.set(key, { count: entry.count + 1, lastAttempt: now });
  }
}

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    const validated = validateBody(loginSchema, body);
    email = validated.email;
    const password = validated.password;

    const rateKey = getClientKey(req, email);
    if (isRateLimited(rateKey)) {
      return apiError(
        "RATE_LIMITED",
        "Too many login attempts. Try again later.",
        429
      );
    }

    const result = await login(email, password);

    if (!result) {
      recordAttempt(rateKey, false);
      return apiError("INVALID_CREDENTIALS", "Invalid email or password", 401);
    }

    recordAttempt(rateKey, true);

    // Audit successful login
    await logAuditEvent(
      result.user,
      "login",
      "auth",
      result.user._id,
      req,
      {
        details: { email: result.user.email },
      }
    );

    const csrfToken = crypto.randomBytes(24).toString("hex");
    const response = apiSuccess({
      token: result.token,
      refreshToken: result.refreshToken,
      user: result.user,
      csrfToken,
    });
    const isProd = process.env.NODE_ENV === "production";
    const authConfig = getAuthConfig();

    response.cookies.set("access_token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: authConfig.accessTtlSec,
      path: "/",
    });
    response.cookies.set("refresh_token", result.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: authConfig.refreshTtlSec,
      path: "/api/auth/refresh",
    });
    response.cookies.set("csrf_token", csrfToken, {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      maxAge: authConfig.refreshTtlSec,
      path: "/",
    });

    return response;
  } catch (error) {
    // Audit failed login attempt
    await db.logAuditEvent(
      "anonymous",
      "anonymous",
      "Anonymous",
      "auth",
      "login",
      "",
      {},
      { email },
      req.ip || "unknown",
      req.headers.get("user-agent") || "unknown",
      "Failed login attempt"
    );

    console.error("Login error:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("LOGIN_FAILED", "An error occurred during login", 500);
  }
}
