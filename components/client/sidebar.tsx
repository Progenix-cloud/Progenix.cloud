'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';

const clientMenuItems = [
  {
    label: 'Dashboard',
    href: '/client/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Project Status',
    href: '/client/project-status',
    icon: Briefcase,
  },
  {
    label: 'Book Meetings',
    href: '/client/meetings',
    icon: Calendar,
  },
  {
    label: 'Documents',
    href: '/client/documents',
    icon: FileText,
  },
  {
    label: 'Messages',
    href: '/client/messages',
    icon: MessageSquare,
  },
  {
    label: 'Milestones',
    href: '/client/milestones',
    icon: CheckCircle,
  },
  {
    label: 'Invoices',
    href: '/client/invoices',
    icon: DollarSign,
  },
  {
    label: 'Team Members',
    href: '/client/team',
    icon: Users,
  },
  {
    label: 'Budget Tracking',
    href: '/client/budget',
    icon: TrendingUp,
  },
  {
    label: 'Change Requests',
    href: '/client/change-requests',
    icon: Download,
  },
  {
    label: 'Support Tickets',
    href: '/client/support',
    icon: HelpCircle,
  },
  {
    label: 'Notifications',
    href: '/client/notifications',
    icon: Bell,
  },
];

export function ClientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/client/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="font-bold text-sidebar-foreground text-sm">SA</span>
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">SoftAgent</span>
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
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
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
