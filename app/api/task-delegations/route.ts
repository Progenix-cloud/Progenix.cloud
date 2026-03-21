import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  taskId: z.string().optional(),
  fromUserId: z.string().optional(),
  toUserId: z.string().optional(),
  status: z.string().optional(),
});

const respondSchema = z.object({
  delegationId: z.string().min(1),
  accepted: z.boolean(),
});

export const GET = withRBAC(
  "taskDelegation",
  "read",
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const delegations = await db.getDelegations({
        taskId: query.taskId,
        fromUserId: query.fromUserId,
        toUserId: query.toUserId,
        status: query.status,
      });

      return apiSuccess(delegations);
    } catch (error) {
      console.error("Failed to fetch delegations:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "DELEGATIONS_FETCH_FAILED",
        "Failed to fetch delegations",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "taskDelegation",
  "update",
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const validated = validateBody(respondSchema, body);

      const delegation = await db.respondToDelegation(
        validated.delegationId,
        validated.accepted
      );

      if (!delegation) {
        return apiError("DELEGATION_NOT_FOUND", "Delegation not found", 404);
      }

      return apiSuccess(delegation, "Delegation updated");
    } catch (error) {
      console.error("Failed to respond to delegation:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "DELEGATION_UPDATE_FAILED",
        "Failed to respond to delegation",
        500
      );
    }
  }
);
