import { NextRequest } from "next/server";
import { ROLES } from "@/lib/auth";
import { db } from "@/lib/db";
import { notificationsService } from "@/lib/notifications-service";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { auditCreate, logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isTemplate: z.enum(["true", "false"]).optional(),
});

const taskInputSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    assignedTo: z.string().optional(),
    projectId: z.string().optional(),
    status: z.string().optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    scheduledDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().optional(),
    tags: z.array(z.string()).optional(),
  })
  .passthrough();

const assignmentSchema = z.object({
  userId: z.string().min(1),
  date: z.string().min(1),
  dueDate: z.string().optional(),
});

const createPayloadSchema = z
  .object({
    tasks: z.array(taskInputSchema).optional(),
    templateIds: z.array(z.string()).optional(),
    assignments: z.array(assignmentSchema).optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "task",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const filter: any = {};
      if (query.projectId) filter.projectId = query.projectId;
      if (query.assignedTo) filter.assignedTo = query.assignedTo;
      if (query.status) {
        const parts = query.status
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        filter.status = parts.length > 1 ? parts : parts[0];
      }
      if (query.date) filter.date = new Date(query.date);
      if (query.startDate) filter.startDate = query.startDate;
      if (query.endDate) filter.endDate = query.endDate;
      if (query.isTemplate !== undefined)
        filter.isTemplate = query.isTemplate === "true";

      if (user.role === ROLES.CLIENT) {
        filter.assignedTo = user._id;
      }

      const tasks = await db.getTasks(filter);

      return apiSuccess(tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("TASKS_FETCH_FAILED", "Failed to fetch tasks", 500);
    }
  }
);

export const POST = withRBAC(
  "task",
  "create",
  async (request: NextRequest, _ctx, user) => {
    try {
      const body = validateBody(createPayloadSchema, await request.json());
      const { tasks, templateIds, assignments } = body;

      let createdTasks = [];

      if (templateIds && assignments) {
        if (!assignments?.length) {
          return apiError(
            "VALIDATION_ERROR",
            "assignments are required when templateIds are provided",
            400
          );
        }
        // Create tasks from templates
        createdTasks = await db.createTasksFromTemplate(
          templateIds,
          assignments,
          user._id
        );

        for (const task of createdTasks) {
          await auditCreate(user, "task", task, request);
          if (task.assignedTo) {
            await logAuditEvent(
              user,
              "update",
              "task",
              task._id,
              request,
              {
                details: {
                  projectId: task.projectId,
                  assignedTo: task.assignedTo,
                },
                notes: "task.assign",
              }
            );
          }

          if (task.assignedTo) {
            await notificationsService.createNotification({
              userId: task.assignedTo,
              type: "task",
              title: "Task assigned",
              message: `Task assigned: ${task.title}`,
              read: false,
              actionUrl: `/client/tasks/${task._id}`,
              actionData: { taskId: task._id, projectId: task.projectId },
            });
          }
        }
      } else {
        const taskList = Array.isArray(tasks)
          ? tasks
          : body?.title
            ? [validateBody(taskInputSchema, body)]
            : null;

        if (!taskList) {
          return apiError("VALIDATION_ERROR", "Invalid request body", 400);
        }

        // Create individual tasks
        for (const taskData of taskList) {
          let teamMemberIds: string[] = [];

          if (!taskData.assignedTo) {
            taskData.assignedTo = user._id;
          }

          if (taskData.projectId) {
            const project = await db.getProjectById(taskData.projectId);
            if (project?.teamMembers?.length) {
              teamMemberIds = project.teamMembers;
            } else {
              const team = await db.getTeamByProjectId(taskData.projectId);
              if (team?.members?.length) {
                teamMemberIds = team.members.map((m: any) => m.userId);
              }
            }
          }

          if (taskData.assignedTo) {
            const assignedUser = await db.getUserById(taskData.assignedTo);
            if (assignedUser?.role === ROLES.CLIENT) {
              const isMember = teamMemberIds.includes(assignedUser._id);
              if (!isMember) {
                return apiError(
                  "FORBIDDEN",
                  "Assigned client is not a member of the project team",
                  403
                );
              }
            }
          }

          const resolvedStatus =
            taskData.status ||
            (taskData.scheduledDate ? "scheduled" : "pending");

          const task = await db.createTask({
            ...taskData,
            status: resolvedStatus,
            createdBy: user._id,
          });
          createdTasks.push(task);

          await auditCreate(user, "task", task, request);
          if (task.assignedTo) {
            await logAuditEvent(
              user,
              "update",
              "task",
              task._id,
              request,
              {
                details: {
                  projectId: task.projectId,
                  assignedTo: task.assignedTo,
                },
                notes: "task.assign",
              }
            );
          }

          // Notify assigned user + team members
          const recipients = new Set<string>(teamMemberIds);
          if (task.assignedTo) recipients.add(task.assignedTo);
          for (const userId of Array.from(recipients)) {
            await notificationsService.createNotification({
              userId,
              type: "task",
              title: "Task assigned",
              message: `Task assigned: ${task.title}`,
              read: false,
              actionUrl: `/client/tasks/${task._id}`,
              actionData: { taskId: task._id, projectId: task.projectId },
            });
          }
        }
      }

      return apiSuccess(createdTasks, "Tasks created");
    } catch (error) {
      console.error("Failed to create tasks:", error);
      if (error instanceof Error && error.message.includes("Validation failed")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("TASKS_CREATE_FAILED", "Failed to create tasks", 500);
    }
  }
);
