import { notificationsService } from "@/lib/notifications-service";
import { NextRequest } from "next/server";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  userId: z.string().optional(),
  unreadOnly: z.coerce.boolean().optional(),
});

const postSchema = z.object({
  action: z.enum(["mark-read", "mark-all-read", "delete", "set-preferences"]),
  userId: z.string().optional(),
  notificationId: z.string().optional(),
  preferences: z.record(z.any()).optional(),
});

export const GET = withRBAC(
  "notification",
  "read",
  async (req: NextRequest, _ctx, user) => {
    try {
      const query = validateQuery(querySchema, req.nextUrl.searchParams);
      const userId = query.userId || user._id;

      if (userId !== user._id && user.role !== "admin") {
        return apiError("FORBIDDEN", "Forbidden", 403);
      }

      const notifications = await notificationsService.getUserNotifications(
        userId,
        query.unreadOnly || false
      );
      const unreadCount = await notificationsService.getUnreadCount(userId);

      return apiSuccess({
        notifications,
        unreadCount,
        total: notifications.length,
      });
    } catch (error) {
      console.error("[v0] Notifications fetch error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError(
        "NOTIFICATIONS_FETCH_FAILED",
        "Failed to fetch notifications",
        500
      );
    }
  }
);

export const POST = withRBAC(
  "notification",
  "update",
  async (req: NextRequest, _ctx, user) => {
    try {
      const body = await req.json();
      const { action, userId, notificationId, preferences } = validateBody(
        postSchema,
        body
      );

      if (action === "mark-read" && notificationId) {
        const notif = await notificationsService.getNotificationById(
          notificationId
        );
        if (!notif) {
          return apiError("NOTIFICATION_NOT_FOUND", "Notification not found", 404);
        }
        if (notif.userId !== user._id && user.role !== "admin") {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        await notificationsService.markAsRead(notificationId);
        return apiSuccess({ id: notificationId }, "Notification marked read");
      }

      if (action === "mark-all-read" && userId) {
        if (userId !== user._id && user.role !== "admin") {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        const count = await notificationsService.markAllAsRead(userId);
        return apiSuccess({ count }, "Notifications marked read");
      }

      if (action === "delete" && notificationId) {
        const notif = await notificationsService.getNotificationById(
          notificationId
        );
        if (!notif) {
          return apiError("NOTIFICATION_NOT_FOUND", "Notification not found", 404);
        }
        if (notif.userId !== user._id && user.role !== "admin") {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        await notificationsService.deleteNotification(notificationId);
        return apiSuccess({ id: notificationId }, "Notification deleted");
      }

      if (action === "set-preferences" && userId) {
        if (userId !== user._id && user.role !== "admin") {
          return apiError("FORBIDDEN", "Forbidden", 403);
        }
        const prefs = await notificationsService.setPreferences(
          userId,
          preferences || {}
        );
        return apiSuccess(prefs, "Preferences updated");
      }

      return apiError("INVALID_ACTION", "Invalid action", 400);
    } catch (error) {
      console.error("[v0] Notifications API error:", error);
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("validation")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("NOTIFICATION_ACTION_FAILED", "Operation failed", 500);
    }
  }
);
