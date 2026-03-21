import { NextRequest } from "next/server";
import { ROLES, ADMIN_ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, apiSuccess, withRBAC } from "@/lib/api-utils";

export const GET = withRBAC(
  "task",
  "read",
  async (
    request: NextRequest,
    { params }: { params: { taskId: string } },
    user
  ) => {
    try {
      const task = await db.getTaskById(params.taskId);
      if (!task) {
        return apiError("TASK_NOT_FOUND", "Task not found", 404);
      }

      const isPrivileged =
        user.role !== ROLES.CLIENT &&
        (ADMIN_ROLES.includes(user.role) || user.role === ROLES.ADMIN);

      if (!isPrivileged && task.assignedTo !== user._id) {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      return apiSuccess(task);
    } catch (error) {
      console.error("Failed to fetch task:", error);
      return apiError("TASK_FETCH_FAILED", "Failed to fetch task", 500);
    }
  }
);
