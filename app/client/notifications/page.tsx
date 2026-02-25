"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, Info, Trash2 } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/notifications?userId=${encodeURIComponent(userId)}`
      );
      const json = await res.json();
      if (json.notifications) setNotifications(json.notifications);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user._id) fetchNotifications(user._id);
      else setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "milestone":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "meeting":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "document":
        return <Info className="w-5 h-5 text-purple-500" />;
      case "alert":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const deleteNotification = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", notificationId: id }),
    });
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            {loading
              ? "Loading..."
              : unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={async () => {
              const userStr = localStorage.getItem("user");
              if (!userStr) return;
              const user = JSON.parse(userStr);
              await fetch("/api/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "mark-all-read",
                  userId: user._id,
                }),
              });
              setNotifications(
                notifications.map((n) => ({ ...n, read: true }))
              );
            }}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  !notification.read
                    ? "bg-accent/10 border-accent"
                    : "hover:bg-muted"
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
                    {new Date(
                      notification.createdAt || notification.date
                    ).toLocaleDateString()}{" "}
                    {new Date(
                      notification.createdAt || notification.date
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
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
            {!loading && notifications.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No notifications
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
