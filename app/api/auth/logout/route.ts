import { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";
import { logAuditEvent } from "@/lib/audit";
import { apiSuccess } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const tokenFromHeader = authHeader?.replace("Bearer ", "");
    const body = await request.json().catch(() => ({}));
    const token = tokenFromHeader || body?.token;

    if (token) {
      const user = await verifySession(token);
      if (user) {
        await logAuditEvent(user, "logout", "auth", user._id, request, {
          details: { email: user.email },
        });
      }
    }
  } catch {
    // ignore audit errors on logout
  }
  const response = apiSuccess({ ok: true }, "Logged out successfully");

  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });

  response.cookies.set("user", "", {
    maxAge: 0,
  });

  response.cookies.set("access_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/api/auth/refresh",
  });
  response.cookies.set("csrf_token", "", {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
