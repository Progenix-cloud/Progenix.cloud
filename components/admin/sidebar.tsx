"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart3,
  FileText,
  AlertCircle,
  Settings,
  DollarSign,
  BookOpen,
  Activity,
  TrendingUp,
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

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
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
          {adminMenuItems.map((item) => {
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
    </aside>
  );
}
