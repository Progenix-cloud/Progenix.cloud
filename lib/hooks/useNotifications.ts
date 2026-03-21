import { useCallback, useEffect, useRef, useState } from "react";
import { notificationsService } from "@/lib/notifications-service";

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connectSSE = useCallback(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;

    const user = JSON.parse(userStr);
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const url = new URL(
      `/api/notifications/sse?userId=${user._id}`,
      window.location.origin
    );
    if (token) url.searchParams.set("token", token);

    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "connected" || data.type === "heartbeat") return;

      // Add new notification
      setNotifications((prev) => [data, ...prev.slice(0, 50)]); // Keep last 50
      setUnreadCount((prev) => prev + 1);

      // Notification sound/vibration
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.title, {
          body: data.message.slice(0, 100),
          icon: "/icon-192.png",
        });
      }
    };

    eventSource.onerror = () => {
      console.log("SSE connection error, reconnecting...");
      eventSource.close();

      // Exponential backoff
      const timeout = Math.min(
        1000 * Math.pow(2, (Date.now() / 1000 / 60) % 60),
        30000
      );
      reconnectTimeoutRef.current = setTimeout(connectSSE, timeout);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const cleanup = connectSSE();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanup?.();
    };
  }, [connectSSE]);

  const markAsRead = async (notificationId: string) => {
    await notificationsService.markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user?._id) return;
    await notificationsService.markAllAsRead(user._id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllRead,
    reconnecting: !!reconnectTimeoutRef.current,
  };
}
