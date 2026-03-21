import { NextRequest } from "next/server";
import { ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const reorderSchema = z.object({
  projectId: z.string().min(1),
  orderedKeys: z.array(z.string()).min(1),
});

export const POST = withRBAC(
  "project",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = await request.json();
      const { projectId, orderedKeys } = validateBody(reorderSchema, body);

      const project = await db.getProjectById(projectId);
      if (!project) {
        return apiError("PROJECT_NOT_FOUND", "Project not found", 404);
      }

      if (user.role === ROLES.CLIENT && project.clientId !== user.clientId) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      const updated = await db.reorderProjectMilestones(
        projectId,
        orderedKeys
      );

      return apiSuccess(updated, "Milestones reordered");
    } catch (error) {
      console.error("Failed to reorder milestones:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "MILESTONES_REORDER_FAILED",
        "Failed to reorder milestones",
        500
      );
    }
  }
);
