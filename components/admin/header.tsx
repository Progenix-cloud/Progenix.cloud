"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Bell, LogOut, Settings } from "lucide-react";

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shadow-sm">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Admin Panel
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
        </Button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="gap-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar className="h-8 w-8 border-2 border-purple-200 dark:border-purple-900">
                <AvatarImage
                  src={user.avatar || "/placeholder.svg"}
                  alt={user.name}
                />
                <AvatarFallback className="bg-purple-600 text-white text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 dark:bg-gray-900 dark:border-gray-700"
          >
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold capitalize">
                  {user.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem className="dark:hover:bg-gray-800">
              <Bell className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="dark:hover:bg-gray-800">
              <Settings className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-gray-700" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
