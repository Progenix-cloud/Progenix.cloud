// Notifications service (DB-backed)
import { db } from "./db";
import { notificationsBus } from "./notifications-bus";

export interface Notification {
  id: string;
  userId: string;
  type:
    | "project"
    | "task"
    | "meeting"
    | "message"
    | "approval"
    | "deadline"
    | "mention"
    | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionData?: Record<string, any>;
}

export interface NotificationPreference {
  userId: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
  channels: {
    projects: boolean;
    tasks: boolean;
    meetings: boolean;
    messages: boolean;
    approvals: boolean;
  };
}

export const notificationsService = {
  // Create a notification and persist
  createNotification: async (
    notification: Omit<Notification, "id" | "createdAt">
  ): Promise<Notification> => {
    const saved = await db.createNotification({
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read || false,
      actionUrl: notification.actionUrl,
      actionData: notification.actionData || {},
    });

    const result: Notification = {
      id: (saved as any)._id,
      userId: saved.userId,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      read: saved.read,
      createdAt: saved.createdAt,
      actionUrl: saved.actionUrl,
      actionData: saved.actionData || {},
    };

    // Trigger delivery hooks (email/push) after persist
    await notificationsService.sendNotification(result);
    // publish to SSE subscribers
    try {
      notificationsBus.publish(result.userId, result);
    } catch (e) {
      console.error("Failed to publish notification to bus", e);
    }
    return result;
  },

  getUserNotifications: async (
    userId: string,
    unreadOnly = false
  ): Promise<Notification[]> => {
    const rows: any[] = await db.getUserNotifications(userId, unreadOnly);
    return rows.map((r) => ({
      id: r._id,
      userId: r.userId,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.createdAt,
      actionUrl: r.actionUrl,
      actionData: r.actionData || {},
    }));
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    return db.markAsRead(notificationId);
  },

  markAllAsRead: async (userId: string): Promise<number> => {
    return db.markAllAsRead(userId);
  },

  deleteNotification: async (notificationId: string): Promise<boolean> => {
    const res = await db.deleteNotification(notificationId);
    return !!res;
  },

  // Preferences persisted in DB
  setPreferences: async (
    userId: string,
    preferences: Partial<NotificationPreference>
  ): Promise<NotificationPreference> => {
    const updated = await db.setPreferences(userId, preferences);
    return updated as NotificationPreference;
  },

  getPreferences: async (userId: string): Promise<NotificationPreference> => {
    const pref = await db.getPreferences(userId);
    return pref as NotificationPreference;
  },

  sendNotification: async (notification: Notification): Promise<boolean> => {
    try {
      const preferences = await notificationsService.getPreferences(
        notification.userId
      );

      if (!preferences.inApp) return false;

      if (
        preferences.email &&
        process.env.ENABLE_EMAIL_NOTIFICATIONS === "true"
      ) {
        await notificationsService.sendEmail(notification);
      }

      if (
        preferences.push &&
        process.env.ENABLE_PUSH_NOTIFICATIONS === "true"
      ) {
        await notificationsService.sendPush(notification);
      }

      return true;
    } catch (error) {
      console.error("[db] Failed to send notification:", error);
      return false;
    }
  },

  sendEmail: async (notification: Notification): Promise<boolean> => {
    try {
      console.log("[db] Email notification sent:", notification);
      return true;
    } catch (error) {
      console.error("[db] Failed to send email:", error);
      return false;
    }
  },

  sendPush: async (notification: Notification): Promise<boolean> => {
    try {
      console.log("[db] Push notification sent:", notification);
      return true;
    } catch (error) {
      console.error("[db] Failed to send push:", error);
      return false;
    }
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    return db.getUnreadCount(userId);
  },

  getAllNotifications: async (): Promise<Notification[]> => {
    const rows: any[] = await db.getAllNotifications();
    return rows.map((r) => ({
      id: r._id,
      userId: r.userId,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.createdAt,
      actionUrl: r.actionUrl,
      actionData: r.actionData || {},
    }));
  },

  getNotificationById: async (
    notificationId: string
  ): Promise<Notification | null> => {
    const r: any = await db.getNotificationById(notificationId);
    if (!r) return null;
    return {
      id: r._id,
      userId: r.userId,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.createdAt,
      actionUrl: r.actionUrl,
      actionData: r.actionData || {},
    };
  },

  updateNotification: async (
    notificationId: string,
    updates: Partial<Omit<Notification, "id" | "createdAt">>
  ): Promise<Notification | null> => {
    const r: any = await db.updateNotification(notificationId, updates as any);
    if (!r) return null;
    return {
      id: r._id,
      userId: r.userId,
      type: r.type,
      title: r.title,
      message: r.message,
      read: r.read,
      createdAt: r.createdAt,
      actionUrl: r.actionUrl,
      actionData: r.actionData || {},
    };
  },

  // Event hooks
  onProjectCreated: async (
    projectId: string,
    teamMemberIds: string[]
  ): Promise<void> => {
    for (const userId of teamMemberIds) {
      await notificationsService.createNotification({
        userId,
        type: "project",
        title: "New Project Assigned",
        message: `You have been assigned to a new project`,
        read: false,
        actionUrl: `/admin/projects/${projectId}`,
        actionData: { projectId },
      });
    }
  },

  onTaskAssigned: async (
    taskId: string,
    userId: string,
    taskTitle: string
  ): Promise<void> => {
    await notificationsService.createNotification({
      userId,
      type: "task",
      title: "New Task Assigned",
      message: `You have been assigned to: ${taskTitle}`,
      read: false,
      actionUrl: `/admin/projects/tasks/${taskId}`,
      actionData: { taskId },
    });
  },

  onMeetingScheduled: async (
    meetingId: string,
    attendeeIds: string[],
    meetingTitle: string
  ): Promise<void> => {
    for (const userId of attendeeIds) {
      await notificationsService.createNotification({
        userId,
        type: "meeting",
        title: "Meeting Scheduled",
        message: `You have a meeting: ${meetingTitle}`,
        read: false,
        actionUrl: `/admin/meetings/${meetingId}`,
        actionData: { meetingId },
      });
    }
  },

  onApprovalNeeded: async (
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<void> => {
    await notificationsService.createNotification({
      userId,
      type: "approval",
      title: "Approval Required",
      message: `A ${resourceType} is waiting for your approval`,
      read: false,
      actionUrl: `/admin/approvals/${resourceId}`,
      actionData: { resourceType, resourceId },
    });
  },

  onDeadlineApproaching: async (
    userId: string,
    taskTitle: string,
    daysLeft: number
  ): Promise<void> => {
    await notificationsService.createNotification({
      userId,
      type: "deadline",
      title: "Deadline Approaching",
      message: `${taskTitle} is due in ${daysLeft} days`,
      read: false,
    });
  },
};

// preferences are persisted via `db` now

export type NotificationsService = typeof notificationsService;
