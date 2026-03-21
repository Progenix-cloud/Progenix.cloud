import { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";
import { apiError, apiSuccess, validateBody } from "@/lib/api-utils";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().optional(),
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token: tokenFromBody } = validateBody(verifySchema, body);
    const authHeader = request.headers.get("authorization");
    const tokenFromHeader = authHeader?.replace("Bearer ", "");
    const tokenFromCookie =
      getCookie(request, "access_token") || getCookie(request, "authToken");
    const token = tokenFromHeader || tokenFromBody || tokenFromCookie;

    if (!token) {
      return apiError("NO_TOKEN", "No token", 401);
    }

    const user = await verifySession(token);

    if (!user) {
      return apiError("INVALID_TOKEN", "Invalid token", 401);
    }

    return apiSuccess({ user });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError("VERIFY_FAILED", "Server error", 500);
  }
}
