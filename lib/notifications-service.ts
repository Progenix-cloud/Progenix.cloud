// Real-time notifications service
export interface Notification {
  id: string;
  userId: string;
  type: 'project' | 'task' | 'meeting' | 'message' | 'approval' | 'deadline' | 'mention';
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

// In-memory notification store (for mock/demo)
const notificationStore = new Map<string, Notification[]>();
const preferenceStore = new Map<string, NotificationPreference>();

export const notificationsService = {
  // Create notification
  createNotification: async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };

    if (!notificationStore.has(notification.userId)) {
      notificationStore.set(notification.userId, []);
    }

    notificationStore.get(notification.userId)!.push(fullNotification);
    console.log('[v0] Notification created:', fullNotification);

    // Trigger webhook if email enabled
    await notificationsService.sendNotification(fullNotification);

    return fullNotification;
  },

  // Get notifications for user
  getUserNotifications: async (userId: string, unreadOnly = false): Promise<Notification[]> => {
    let notifications = notificationStore.get(userId) || [];
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  // Mark as read
  markAsRead: async (notificationId: string): Promise<boolean> => {
    for (const [, notifications] of notificationStore) {
      const notif = notifications.find(n => n.id === notificationId);
      if (notif) {
        notif.read = true;
        return true;
      }
    }
    return false;
  },

  // Mark all as read for user
  markAllAsRead: async (userId: string): Promise<number> => {
    const notifications = notificationStore.get(userId) || [];
    let count = 0;
    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        count++;
      }
    });
    return count;
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    for (const [userId, notifications] of notificationStore) {
      const index = notifications.findIndex(n => n.id === notificationId);
      if (index > -1) {
        notifications.splice(index, 1);
        return true;
      }
    }
    return false;
  },

  // Set notification preferences
  setPreferences: async (userId: string, preferences: Partial<NotificationPreference>): Promise<NotificationPreference> => {
    const existing = preferenceStore.get(userId) || {
      userId,
      email: true,
      push: true,
      inApp: true,
      channels: {
        projects: true,
        tasks: true,
        meetings: true,
        messages: true,
        approvals: true,
      },
    };

    const updated = { ...existing, ...preferences };
    preferenceStore.set(userId, updated);
    return updated;
  },

  // Get notification preferences
  getPreferences: async (userId: string): Promise<NotificationPreference> => {
    return preferenceStore.get(userId) || {
      userId,
      email: true,
      push: true,
      inApp: true,
      channels: {
        projects: true,
        tasks: true,
        meetings: true,
        messages: true,
        approvals: true,
      },
    };
  },

  // Send notification (webhook integration point)
  sendNotification: async (notification: Notification): Promise<boolean> => {
    try {
      const preferences = await notificationsService.getPreferences(notification.userId);

      // Check if user wants this type of notification
      if (!preferences.inApp) {
        return false;
      }

      // Send email if enabled and configured
      if (preferences.email && process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
        await notificationsService.sendEmail(notification);
      }

      // Send push if enabled
      if (preferences.push && process.env.ENABLE_PUSH_NOTIFICATIONS === 'true') {
        await notificationsService.sendPush(notification);
      }

      return true;
    } catch (error) {
      console.error('[v0] Failed to send notification:', error);
      return false;
    }
  },

  // Email sending (integration point with email service)
  sendEmail: async (notification: Notification): Promise<boolean> => {
    try {
      // This would integrate with your email service (SendGrid, Mailgun, etc.)
      console.log('[v0] Email notification sent:', notification);
      // Example: Call external email API
      // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {...})
      return true;
    } catch (error) {
      console.error('[v0] Failed to send email:', error);
      return false;
    }
  },

  // Push notification (integration point)
  sendPush: async (notification: Notification): Promise<boolean> => {
    try {
      console.log('[v0] Push notification sent:', notification);
      // This would integrate with push notification service
      return true;
    } catch (error) {
      console.error('[v0] Failed to send push:', error);
      return false;
    }
  },

  // Get notification count for user
  getUnreadCount: async (userId: string): Promise<number> => {
    const notifications = await notificationsService.getUserNotifications(userId, true);
    return notifications.length;
  },

  // Auto-generate notifications based on events
  onProjectCreated: async (projectId: string, teamMemberIds: string[]): Promise<void> => {
    for (const userId of teamMemberIds) {
      await notificationsService.createNotification({
        userId,
        type: 'project',
        title: 'New Project Assigned',
        message: `You have been assigned to a new project`,
        read: false,
        actionUrl: `/admin/projects/${projectId}`,
        actionData: { projectId },
      });
    }
  },

  onTaskAssigned: async (taskId: string, userId: string, taskTitle: string): Promise<void> => {
    await notificationsService.createNotification({
      userId,
      type: 'task',
      title: 'New Task Assigned',
      message: `You have been assigned to: ${taskTitle}`,
      read: false,
      actionUrl: `/admin/projects/tasks/${taskId}`,
      actionData: { taskId },
    });
  },

  onMeetingScheduled: async (meetingId: string, attendeeIds: string[], meetingTitle: string): Promise<void> => {
    for (const userId of attendeeIds) {
      await notificationsService.createNotification({
        userId,
        type: 'meeting',
        title: 'Meeting Scheduled',
        message: `You have a meeting: ${meetingTitle}`,
        read: false,
        actionUrl: `/admin/meetings/${meetingId}`,
        actionData: { meetingId },
      });
    }
  },

  onApprovalNeeded: async (userId: string, resourceType: string, resourceId: string): Promise<void> => {
    await notificationsService.createNotification({
      userId,
      type: 'approval',
      title: 'Approval Required',
      message: `A ${resourceType} is waiting for your approval`,
      read: false,
      actionUrl: `/admin/approvals/${resourceId}`,
      actionData: { resourceType, resourceId },
    });
  },

  onDeadlineApproaching: async (userId: string, taskTitle: string, daysLeft: number): Promise<void> => {
    await notificationsService.createNotification({
      userId,
      type: 'deadline',
      title: 'Deadline Approaching',
      message: `${taskTitle} is due in ${daysLeft} days`,
      read: false,
    });
  },
};

export type NotificationsService = typeof notificationsService;
