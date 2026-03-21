import { NextRequest } from "next/server";
import { ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
  projectId: z.string().optional(),
});

export const POST = withRBAC(
  "task",
  "update",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(reorderSchema, await request.json());
      const orderedIds: string[] = body.orderedIds;
      const projectId: string | undefined = body.projectId;

      const scope =
        user.role === ROLES.CLIENT
          ? { assignedTo: user._id }
          : projectId
          ? { projectId }
          : undefined;

      const updated = await db.reorderTasks(orderedIds, scope);

      await logAuditEvent(user, "update", "task", "reorder", request, {
        details: { orderedIds, projectId },
        notes: "task.reorder",
      });

      return apiSuccess(updated, "Tasks reordered");
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("TASKS_REORDER_FAILED", "Failed to reorder tasks", 500);
    }
  }
);
