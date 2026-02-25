import { NextRequest, NextResponse } from 'next/server';
import { notificationsService } from '@/lib/notifications-service';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const all = await notificationsService.getAllNotifications();
    return NextResponse.json({ success: true, data: all });
  } catch (error) {
    console.error('Admin notifications fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, message, type = 'message', target = 'all', userIds = [], actionUrl } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 });
    }

    // Publish to all users
    if (target === 'all') {
      const users = await db.getUsers();
      const created: any[] = [];
      for (const user of users) {
        const notif = await notificationsService.createNotification({
          userId: user._id,
          type,
          title,
          message,
          read: false,
          actionUrl,
        });
        created.push(notif);
      }

      return NextResponse.json({ success: true, createdCount: created.length });
    }

    // Publish to specific userIds
    if (Array.isArray(userIds) && userIds.length > 0) {
      const created: any[] = [];
      for (const userId of userIds) {
        const notif = await notificationsService.createNotification({
          userId,
          type,
          title,
          message,
          read: false,
          actionUrl,
        });
        created.push(notif);
      }
      return NextResponse.json({ success: true, createdCount: created.length });
    }

    return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
  } catch (error) {
    console.error('Admin notifications create error:', error);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates } = body;
    if (!id || !updates) return NextResponse.json({ error: 'id and updates required' }, { status: 400 });

    const updated = await notificationsService.updateNotification(id, updates);
    if (!updated) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Admin notifications update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const ok = await notificationsService.deleteNotification(id);
    return NextResponse.json({ success: ok });
  } catch (error) {
    console.error('Admin notifications delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
