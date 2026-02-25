"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, Calendar, Bell, FilePlus } from "lucide-react";

export function QuickActionsButton() {
  const router = useRouter();

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="h-14 w-14 rounded-full shadow-lg flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
            aria-label="Quick actions"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuItem
            onClick={() => router.push("/admin/meetings/create")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Create Meeting
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/admin/notifications/create")}
          >
            <Bell className="mr-2 h-4 w-4" />
            Create Notification
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push("/admin/projects/create")}
          >
            <FilePlus className="mr-2 h-4 w-4" />
            Create Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
