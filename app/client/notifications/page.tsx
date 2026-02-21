'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Info, Trash2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'milestone',
      title: 'Milestone Completed: Design Phase',
      message: 'The design phase of your project has been marked as complete.',
      date: '2024-01-22',
      read: false,
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Meeting Scheduled',
      message: 'Your project status meeting is scheduled for Jan 25, 2024 at 2:00 PM',
      date: '2024-01-21',
      read: false,
    },
    {
      id: '3',
      type: 'document',
      title: 'New Document Uploaded',
      message: 'Technical Specification Document has been uploaded by your team.',
      date: '2024-01-20',
      read: true,
    },
    {
      id: '4',
      type: 'alert',
      title: 'Project Alert',
      message: 'Development phase is approaching deadline. Status: 80% complete.',
      date: '2024-01-19',
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Team Update',
      message: 'New team member assigned to your project.',
      date: '2024-01-18',
      read: true,
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'meeting':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'document':
        return <Info className="w-5 h-5 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline">Mark All as Read</Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  !notification.read ? 'bg-accent/10 border-accent' : 'hover:bg-muted'
                }`}
              >
                {getTypeIcon(notification.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{notification.title}</h3>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notification.date).toLocaleDateString()}{' '}
                    {new Date(notification.date).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
