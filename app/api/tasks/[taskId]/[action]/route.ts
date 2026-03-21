import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const reviewSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
});

const delegateSchema = z.object({
  toUserId: z.string().min(1),
  reason: z.string().min(1),
});

export const POST = withRBAC(
  "task",
  "update",
  async (
    request: NextRequest,
    { params }: { params: { action: string; taskId: string } },
    user
  ) => {
    try {

      const { ROLES } = await import("@/lib/auth");
      const isPM = user.role === ROLES.PROJECT_MANAGER;

      const { action, taskId } = params;
      let body: any = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }

      switch (action) {
        case "start": {
          const startedTask = await db.startTask(taskId, user._id);
          if (!startedTask) {
            return apiError(
              "TASK_NOT_FOUND",
              "Task not found or not assigned to you",
              404
            );
          }
          await logAuditEvent(user, "update", "task", taskId, request, {
            details: { status: "in-progress" },
            notes: "task.start",
          });
          return apiSuccess(startedTask, "Task started");
        }

        case "submit": {
          const submittedTask = await db.submitTaskForReview(taskId, user._id);
          if (!submittedTask) {
            return apiError(
              "TASK_NOT_FOUND",
              "Task not found or not assigned to you",
              404
            );
          }
          await logAuditEvent(user, "update", "task", taskId, request, {
            details: { status: "submitted" },
            notes: "task.submit",
          });
          return apiSuccess(submittedTask, "Task submitted for review");
        }

        case "review": {
          if (!isPM) {
            return apiError("FORBIDDEN", "PM only", 403);
          }
          const { approved, notes } = validateBody(reviewSchema, body);
          const reviewNotes =
            typeof notes === "string" ? notes.trim() : "";
          const reviewedTask = await db.reviewTask(taskId, user._id, approved);
          if (!reviewedTask) {
            return apiError("TASK_NOT_FOUND", "Task not found", 404);
          }
          await logAuditEvent(user, "update", "task", taskId, request, {
            details: {
              approved,
              ...(reviewNotes ? { reviewNotes } : {}),
            },
            notes: "task.review",
          });
          return apiSuccess(reviewedTask, "Task reviewed");
        }

        case "complete": {
          if (!isPM) {
            return apiError("FORBIDDEN", "PM only", 403);
          }
          const completedTask = await db.completeTask(taskId, user._id);
          if (!completedTask) {
            return apiError("TASK_NOT_FOUND", "Task not found", 404);
          }

          // Auto-mark attendance if all daily tasks completed
          await db.markAttendanceForUser(
            completedTask.assignedTo,
            new Date(completedTask.scheduledDate || completedTask.completedDate)
          );

          await logAuditEvent(user, "update", "task", taskId, request, {
            details: { status: "completed" },
            notes: "task.complete",
          });

          return apiSuccess(completedTask, "Task completed");
        }

        case "delegate": {
          if (!isPM) {
            return apiError("FORBIDDEN", "PM only", 403);
          }
          const { toUserId, reason } = validateBody(delegateSchema, body);
          const delegatedTask = await db.delegateTask(
            taskId,
            user._id,
            toUserId,
            reason
          );
          if (!delegatedTask) {
            return apiError("TASK_NOT_FOUND", "Task not found", 404);
          }
          await logAuditEvent(user, "update", "task", taskId, request, {
            details: { toUserId, reason },
            notes: "task.delegate",
          });
          return apiSuccess(delegatedTask, "Task delegated");
        }

        default:
          return apiError("INVALID_ACTION", "Invalid action", 400);
      }
    } catch (error) {
      console.error(`Error performing task action ${params.action}:`, error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("TASK_ACTION_FAILED", "Failed to perform action", 500);
    }
  }
);
