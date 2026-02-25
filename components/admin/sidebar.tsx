"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  AlertCircle,
  Settings,
  DollarSign,
  BookOpen,
  Activity,
  TrendingUp,
  Bell,
  LogOut,
} from "lucide-react";

const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: Briefcase,
  },
  {
    label: "Leads",
    href: "/admin/clients",
    icon: Users,
  },
  {
    label: "Team Reports",
    href: "/admin/team",
    icon: Users,
  },
  {
    label: "Operations",
    href: "/admin/analytics",
    icon: Activity,
  },
  {
    label: "Monitoring",
    href: "/admin/risks",
    icon: AlertCircle,
  },
  {
    label: "Knowledge Base",
    href: "/admin/knowledge-base",
    icon: BookOpen,
  },
  {
    label: "Business",
    href: "/admin/business",
    icon: TrendingUp,
  },
  {
    label: "Finance Reports",
    href: "/admin/finance",
    icon: DollarSign,
  },
  {
    label: "Core Member",
    href: "/admin/team",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
    }

    return () => {
      // cleanup SSE on unmount
      try {
        evtRef.current?.close();
        evtRef.current = null;
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const fetchNotifications = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/notifications?userId=${encodeURIComponent(userId)}`
      );
      const json = await res.json();
      if (json.notifications) setNotifications(json.notifications);
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  };

  // SSE subscription
  const evtRef = useRef<EventSource | null>(null);

  const startSSE = (userId: string) => {
    try {
      const src = new EventSource(
        `/api/notifications/stream?userId=${encodeURIComponent(userId)}`
      );
      src.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setNotifications((s) => [data, ...s]);
        } catch (err) {
          // ignore heartbeat and malformed
        }
      };
      src.onerror = () => {
        src.close();
        evtRef.current = null;
      };
      evtRef.current = src;
    } catch (e) {
      console.error("Failed to start SSE", e);
    }
  };

  const stopSSE = () => {
    try {
      evtRef.current?.close();
      evtRef.current = null;
    } catch (e) {
      // ignore
    }
  };

  // handle dropdown open change
  useEffect(() => {
    if (!notifOpen) {
      stopSSE();
      return;
    }
    if (notifOpen && user) {
      fetchNotifications(user._id);
      startSSE(user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifOpen, user]);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-read", notificationId: id }),
    });
    setNotifications((s) =>
      s.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotif = async (id: string) => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", notificationId: id }),
    });
    setNotifications((s) => s.filter((n) => n.id !== id));
  };

  return (
    <aside className="w-64 bg-sidebar dark:bg-gray-950 border-r border-sidebar-border dark:border-gray-800 flex flex-col">
      <div className="p-6 border-b border-sidebar-border dark:border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 dark:from-purple-500 dark:to-purple-400 flex items-center justify-center shadow-lg">
            <span className="font-bold text-white text-sm">SA</span>
          </div>
          <span className="font-bold text-lg text-sidebar-foreground dark:text-white">
            SoftAgent
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-purple-600 dark:bg-purple-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border dark:border-gray-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <DropdownMenu
              open={notifOpen}
              onOpenChange={(o) => setNotifOpen(o)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 max-h-64 overflow-auto"
              >
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Notifications</span>
                    <div className="flex items-center gap-3">
                      <button
                        className="text-sm text-muted-foreground"
                        onClick={async () => {
                          if (!user) return;
                          await fetch("/api/notifications", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              action: "mark-all-read",
                              userId: user._id,
                            }),
                          });
                          // refetch
                          setNotifications((n) =>
                            n.map((x) => ({ ...x, read: true }))
                          );
                        }}
                      >
                        Mark all
                      </button>
                      <Link
                        href="/admin/notifications"
                        className="text-sm text-primary"
                      >
                        View all
                      </Link>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">
                    No notifications
                  </div>
                )}

                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 border-b last:border-b-0 flex items-start justify-between"
                  >
                    <div className="pr-2">
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {n.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {!n.read && (
                        <button
                          className="text-xs text-primary"
                          onClick={async () => {
                            await markAsRead(n.id);
                          }}
                        >
                          {"Mark"}
                        </button>
                      )}
                      <button
                        className="text-xs text-destructive"
                        onClick={async () => {
                          await deleteNotif(n.id);
                        }}
                      >
                        {"Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.avatar || "/placeholder.svg"}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback>
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 dark:bg-gray-900 dark:border-gray-700"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Settings
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700" />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("user");
                    window.location.href = "/auth/login";
                  }}
                  className="text-red-600 dark:text-red-400 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </aside>
  );
}
