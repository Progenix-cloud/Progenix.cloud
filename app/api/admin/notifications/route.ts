import { NextRequest } from "next/server";
import { notificationsService } from "@/lib/notifications-service";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { logAuditEvent } from "@/lib/audit";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z
    .enum([
      "project",
      "task",
      "meeting",
      "message",
      "approval",
      "deadline",
      "mention",
      "system",
    ])
    .optional(),
  target: z.enum(["all", "admins", "clients", "both", "users"]).optional(),
  userIds: z.array(z.string()).optional(),
  actionUrl: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  updates: z.record(z.any()),
});

const deleteQuerySchema = z.object({
  id: z.string().min(1),
});

export const GET = withRBAC("admin", "admin", async (_req: NextRequest) => {
  try {
    const all = await notificationsService.getAllNotifications();
    return apiSuccess(all);
  } catch (error) {
    console.error("Admin notifications fetch error:", error);
    return apiError(
      "ADMIN_NOTIFICATIONS_FETCH_FAILED",
      "Failed to fetch notifications",
      500
    );
  }
});

export const POST = withRBAC(
  "admin",
  "admin",
  async (req: NextRequest, _ctx, user) => {
    try {
      const body = await req.json();
      const validated = validateBody(createSchema, body);
      const {
        title,
        message,
        type = "message",
        target = "all",
        userIds = [],
        actionUrl,
      } = validated;

      const adminsRoles = [
        "project_manager",
        "business_head",
        "lead_architect",
        "developer",
      ];
      const sendNotifications = async (targetUsers: any[]) => {
        const created: any[] = [];
        for (const userItem of targetUsers) {
          const notif = await notificationsService.createNotification({
            userId: userItem._id,
            type,
            title,
            message,
            read: false,
            actionUrl,
          });
          created.push(notif);
        }
        return created;
      };

      if (target === "all" || target === "both") {
        const users = await db.getUsers();
        const created = await sendNotifications(users);

        await logAuditEvent(user, "create", "admin.notification", "bulk", req, {
          details: { target, title, count: created.length },
        });

        return apiSuccess(
          { createdCount: created.length },
          "Notifications sent"
        );
      }

      if (target === "admins") {
        const users = await db.getUsers();
        const adminUsers = users.filter((u: any) =>
          adminsRoles.includes(u.role)
        );
        const created = await sendNotifications(adminUsers);

        await logAuditEvent(user, "create", "admin.notification", "bulk", req, {
          details: { target, title, count: created.length },
        });

        return apiSuccess(
          { createdCount: created.length },
          "Notifications sent"
        );
      }

      if (target === "clients") {
        const clientUsers = await db.getUsers({ role: "client" });
        const created = await sendNotifications(clientUsers);

        await logAuditEvent(user, "create", "admin.notification", "bulk", req, {
          details: { target, title, count: created.length },
        });

        return apiSuccess(
          { createdCount: created.length },
          "Notifications sent"
        );
      }

      // Publish to specific userIds
      if (Array.isArray(userIds) && userIds.length > 0) {
        const allUsers = await db.getUsers();
        const targetUsers = allUsers.filter((u: any) =>
          userIds.includes(u._id)
        );
        const created = await sendNotifications(targetUsers);

        await logAuditEvent(user, "create", "admin.notification", "bulk", req, {
          details: { target: "users", userIds, title, count: created.length },
        });

        return apiSuccess(
          { createdCount: created.length },
          "Notifications sent"
        );
      }

      return apiError("INVALID_TARGET", "Invalid target", 400);
    } catch (error) {
      console.error("Admin notifications create error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("ADMIN_NOTIFICATION_CREATE_FAILED", "Create failed", 500);
    }
  }
);

export const PUT = withRBAC(
  "admin",
  "admin",
  async (req: NextRequest, _ctx, user) => {
    try {
      const body = await req.json();
      const { id, updates } = validateBody(updateSchema, body);

      const existing = await notificationsService.getNotificationById(id);
      const updated = await notificationsService.updateNotification(
        id,
        updates
      );
      if (!updated)
        return apiError(
          "NOTIFICATION_NOT_FOUND",
          "Notification not found",
          404
        );

      await logAuditEvent(user, "update", "admin.notification", id, req, {
        oldValue: existing,
        newValue: updated,
      });

      return apiSuccess(updated, "Notification updated");
    } catch (error) {
      console.error("Admin notifications update error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("ADMIN_NOTIFICATION_UPDATE_FAILED", "Update failed", 500);
    }
  }
);

export const DELETE = withRBAC(
  "admin",
  "admin",
  async (req: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const { id } = validateQuery(deleteQuerySchema, searchParams);

      const existing = await notificationsService.getNotificationById(id);
      const ok = await notificationsService.deleteNotification(id);

      if (ok && existing) {
        await logAuditEvent(user, "delete", "admin.notification", id, req, {
          oldValue: existing,
        });
      }

      return apiSuccess({ ok }, "Notification deleted");
    } catch (error) {
      console.error("Admin notifications delete error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("ADMIN_NOTIFICATION_DELETE_FAILED", "Delete failed", 500);
    }
  }
);
