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
  Calendar,
  FileText,
  MessageSquare,
  CheckCircle,
  DollarSign,
  Users,
  HelpCircle,
  Download,
  TrendingUp,
  Bell,
  LogOut,
  Settings,
} from "lucide-react";

const clientMenuItems = [
  {
    label: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Project Status",
    href: "/client/project-status",
    icon: Briefcase,
  },
  {
    label: "Book Meetings",
    href: "/client/meetings",
    icon: Calendar,
  },
  {
    label: "Documents",
    href: "/client/documents",
    icon: FileText,
  },
  {
    label: "Messages",
    href: "/client/messages",
    icon: MessageSquare,
  },
  {
    label: "Milestones",
    href: "/client/milestones",
    icon: CheckCircle,
  },
  {
    label: "Invoices",
    href: "/client/invoices",
    icon: DollarSign,
  },
  {
    label: "Team Members",
    href: "/client/team",
    icon: Users,
  },
  {
    label: "Budget Tracking",
    href: "/client/budget",
    icon: TrendingUp,
  },
  {
    label: "Change Requests",
    href: "/client/change-requests",
    icon: Download,
  },
  {
    label: "Support Tickets",
    href: "/client/support",
    icon: HelpCircle,
  },
  {
    label: "Notifications",
    href: "/client/notifications",
    icon: Bell,
  },
];

export function ClientSidebar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const pathname = usePathname();
  const [user, setUser] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const evtRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchNotifications(u._id);
    }
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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

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
          // ignore
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

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/client/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-bold text-sidebar-foreground text-sm">
              SA
            </span>
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">
            SoftAgent
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {clientMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-3">
          <div>
            <DropdownMenu
              open={notifOpen}
              onOpenChange={(o) => setNotifOpen(o)}
            >
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-72 max-h-64 overflow-auto"
              >
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Notifications</span>
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
                        setNotifications((s) =>
                          s.map((x) => ({ ...x, read: true }))
                        );
                      }}
                    >
                      Mark all
                    </button>
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/client/settings" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/client/settings" className="flex items-center">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("user");
                    window.location.href = "/auth/login";
                  }}
                  className="text-destructive"
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
