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
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  category: z.string().optional(),
  limit: z.coerce.number().optional(),
});

const feedbackSchema = z
  .object({
    message: z.string().min(1).optional(),
    rating: z.number().optional(),
    category: z.string().optional(),
    projectId: z.string().optional(),
    clientId: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "feedback",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const scopedClientId =
        user.role === "client" ? user.clientId : query.clientId;
      if (user.role === "client" && !user.clientId) {
        return apiSuccess([]);
      }

      const feedback = await db.getFeedback({
        projectId: query.projectId || undefined,
        clientId: scopedClientId || undefined,
        category: query.category || undefined,
        limit: query.limit || undefined,
      });

      return apiSuccess(feedback);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("FEEDBACK_FETCH_FAILED", "Failed to fetch feedback", 500);
    }
  }
);

export const POST = withRBAC(
  "feedback",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(feedbackSchema, await request.json());

      if (user.role === "client") {
        if (body.clientId && body.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      const newFeedback = await db.createFeedback({
        ...body,
        userId: body.userId || user._id,
        clientId:
          user.role === "client" ? user.clientId || body.clientId : body.clientId,
        date: body.date || new Date(),
      });

      return apiSuccess(newFeedback, "Feedback submitted");
    } catch (error) {
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("FEEDBACK_CREATE_FAILED", "Failed to submit feedback", 500);
    }
  }
);
