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
  status: z.string().optional(),
});

const createSchema = z
  .object({
    title: z.string().min(1),
    projectId: z.string().optional(),
    clientId: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "changeRequest",
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

      const changeRequests = await db.getChangeRequests({
        projectId: query.projectId || undefined,
        status: query.status || undefined,
        clientId: scopedClientId || undefined,
      });

      return apiSuccess(changeRequests);
    } catch (error) {
      console.error("Failed to fetch change requests:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "CHANGE_REQUESTS_FETCH_FAILED",
        "Failed to fetch change requests",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "changeRequest",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(createSchema, await request.json());

      if (user.role === "client") {
        if (!body.projectId) {
          return apiError("PROJECT_REQUIRED", "Project is required", 400);
        }
        const project = await db.getProjectById(body.projectId);
        if (!project || project.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        if (body.clientId && body.clientId !== user.clientId) {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
      }

      const newRequest = await db.createChangeRequest({
        ...body,
        clientId:
          user.role === "client" ? user.clientId || body.clientId : body.clientId,
        status: body.status || "pending",
        submittedDate: body.submittedDate || new Date(),
      });

      return apiSuccess(newRequest, "Change request created");
    } catch (error) {
      console.error("Failed to create change request:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "CHANGE_REQUEST_CREATE_FAILED",
        "Failed to create change request",
        500
      );
    }
  }
);
