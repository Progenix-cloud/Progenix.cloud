import { NextRequest } from "next/server";
import { getAuthConfig, issueTokens, verifyRefreshToken } from "@/lib/auth";
import crypto from "crypto";
import { apiError, apiSuccess, validateBody } from "@/lib/api-utils";
import { z } from "zod";

const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

function getCookie(req: NextRequest, name: string) {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;
  const parts = cookie.split(";").map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { refreshToken: tokenFromBody } = validateBody(refreshSchema, body);
    const tokenFromCookie = getCookie(req, "refresh_token");
    const refreshToken = tokenFromBody || tokenFromCookie;

    if (!refreshToken) {
      return apiError("MISSING_REFRESH_TOKEN", "Missing refresh token", 401);
    }

    const user = await verifyRefreshToken(refreshToken);
    if (!user) {
      return apiError("INVALID_REFRESH_TOKEN", "Invalid refresh token", 401);
    }

    const { accessToken, refreshToken: newRefresh } = issueTokens(user);
    const csrfToken = crypto.randomBytes(24).toString("hex");
    const response = apiSuccess({
      token: accessToken,
      refreshToken: newRefresh,
      user,
      csrfToken,
    });
    const isProd = process.env.NODE_ENV === "production";
    const authConfig = getAuthConfig();

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: authConfig.accessTtlSec,
      path: "/",
    });
    response.cookies.set("refresh_token", newRefresh, {
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
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("TOKEN_REFRESH_FAILED", "Failed to refresh token", 500);
  }
}
