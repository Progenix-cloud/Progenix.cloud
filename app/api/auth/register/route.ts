import { register } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAuditEvent } from "@/lib/audit";
import { NextRequest } from "next/server";
import { apiError, apiSuccess, validateBody } from "@/lib/api-utils";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = validateBody(registerSchema, body);

    const result = await register(email, name, password, "client");

    if (!result) {
      return apiError(
        "REGISTRATION_FAILED",
        "User already exists or registration failed",
        409
      );
    }

    // Lead sync for new client
    if (result.user.role === "client") {
      const existingLead = await db.getLeadByEmail(result.user.email);
      if (!existingLead) {
        await db.createLead({
          fullName: result.user.name,
          company: result.user.name,
          email: result.user.email,
          source: "Agency",
          status: "New",
          dateAdded: new Date(),
          updatedAt: new Date(),
          createdDate: new Date(),
          updatedDate: new Date(),
        });
      }
    }

    // Audit successful registration
    await logAuditEvent(result.user, "register", "auth", result.user._id, req, {
      details: { email: result.user.email, name: result.user.name },
    });

    return apiSuccess(
      {
        user: result.user,
        token: result.token,
        refreshToken: result.refreshToken,
      },
      "User registered successfully"
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("validation")
    ) {
      return apiError("VALIDATION_ERROR", error.message, 400);
    }
    return apiError(
      "REGISTRATION_ERROR",
      "An error occurred during registration",
      500
    );
  }
}
