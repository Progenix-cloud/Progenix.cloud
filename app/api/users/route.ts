import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  role: z.string().optional(),
  clientId: z.string().optional(),
});

export const GET = withRBAC(
  "user",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      if (user.role === "client") {
        const allUsers = await db.getUsers({
          role: query.role || undefined,
        });
        const filtered = allUsers.filter(
          (u: any) => u.role !== "client" || u._id === user._id
        );
        return apiSuccess(filtered);
      }

      const users = await db.getUsers({
        role: query.role || undefined,
        clientId: query.clientId || undefined,
      });
      return apiSuccess(users);
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", err.message, 400);
      }
      return apiError("USERS_FETCH_FAILED", "Failed to fetch users", 500);
    }
  }
);
