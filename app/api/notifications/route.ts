import { notificationsService } from '@/lib/notifications-service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    const unreadOnly = req.nextUrl.searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const notifications = await notificationsService.getUserNotifications(userId, unreadOnly);
    const unreadCount = await notificationsService.getUnreadCount(userId);

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error('[v0] Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId, notificationId, preferences } = body;

    if (action === 'mark-read' && notificationId) {
      await notificationsService.markAsRead(notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === 'mark-all-read' && userId) {
      const count = await notificationsService.markAllAsRead(userId);
      return NextResponse.json({ success: true, count });
    }

    if (action === 'delete' && notificationId) {
      await notificationsService.deleteNotification(notificationId);
      return NextResponse.json({ success: true });
    }

    if (action === 'set-preferences' && userId) {
      const prefs = await notificationsService.setPreferences(userId, preferences);
      return NextResponse.json(prefs);
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[v0] Notifications API error:', error);
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    );
  }
}
