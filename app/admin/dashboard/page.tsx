"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Smile,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Target,
  Video,
  AlertCircle,
  CheckCircle,
  MessageCircle,
  Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { buildAuthHeaders } from "@/lib/client-auth";
import { addDays, differenceInDays, format } from "date-fns";

interface TaskItem {
  _id: string;
  title: string;
  status?: string;
  assignedTo?: string;
  createdBy?: string;
  scheduledDate?: string;
  dueDate?: string;
  createdAt?: string;
  createdDate?: string;
  subtasks?: { id?: string; title?: string; status?: string }[];
}

interface UserItem {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

interface TimelineItem {
  id: string;
  type: "meeting" | "milestone";
  title: string;
  date: string;
  projectName?: string;
}

const resolveTaskDate = (task: TaskItem) => {
  const raw =
    task.scheduledDate || task.dueDate || task.createdAt || task.createdDate;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export default function AdminDashboardPage() {
  const [anonymousFeedback, setAnonymousFeedback] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
  const [globalTasks, setGlobalTasks] = useState<TaskItem[]>([]);
  const [usersById, setUsersById] = useState<Record<string, UserItem>>({});
  const [tasksLoading, setTasksLoading] = useState(true);
  const [isGlobalTasksOpen, setIsGlobalTasksOpen] = useState(false);
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState("ready");
  const [moodNote, setMoodNote] = useState("");
  const [isSavingMood, setIsSavingMood] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard", {
        headers: buildAuthHeaders(),
      });
      const result = await response.json();
      if (result.success) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setTasksLoading(true);
        const userStr =
          typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (!userStr) {
          setTasksLoading(false);
          return;
        }
        const currentUser = JSON.parse(userStr);

        const [tasksRes, usersRes] = await Promise.all([
          fetch("/api/tasks", { headers: buildAuthHeaders() }),
          fetch("/api/users", { headers: buildAuthHeaders() }),
        ]);
        const [tasksData, usersData] = await Promise.all([
          tasksRes.json(),
          usersRes.json(),
        ]);

        const users: UserItem[] = usersData?.data || [];
        const userMap = users.reduce<Record<string, UserItem>>((acc, u) => {
          acc[u._id] = u;
          return acc;
        }, {});
        setUsersById(userMap);

        const pmIds = new Set(
          users.filter((u) => u.role === "project_manager").map((u) => u._id)
        );
        const tasks: TaskItem[] = tasksData?.data || [];
        const pmTasks = tasks.filter((task) =>
          task.createdBy ? pmIds.has(task.createdBy) : false
        );

        setGlobalTasks(pmTasks);
        setMyTasks(
          pmTasks.filter((task) => task.assignedTo === currentUser._id)
        );
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, []);

  const handleAnonymousFeedback = async () => {
    if (!anonymousFeedback.trim()) {
      toast.error("Please enter feedback before submitting.");
      return;
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          category: "anonymous",
          message: anonymousFeedback.trim(),
          date: new Date(),
        }),
      });

      if (res.ok) {
        toast.success("Feedback submitted.");
        setAnonymousFeedback("");
        fetchDashboardData();
      } else {
        toast.error("Failed to submit feedback.");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback.");
    }
  };

  const handleSupportRequest = async () => {
    if (!supportMessage.trim()) {
      toast.error("Please enter a support request.");
      return;
    }

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          category: "support",
          message: supportMessage.trim(),
          date: new Date(),
        }),
      });

      if (res.ok) {
        toast.success("Support request sent.");
        setSupportMessage("");
        fetchDashboardData();
      } else {
        toast.error("Failed to send support request.");
      }
    } catch (error) {
      console.error("Failed to send support request:", error);
      toast.error("Failed to send support request.");
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    try {
      setIsSavingMood(true);
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          category: "mood",
          mood: selectedMood,
          message: moodNote.trim() || undefined,
          date: new Date(),
        }),
      });
      if (res.ok) {
        toast.success("Mood updated.");
        setIsMoodDialogOpen(false);
        setMoodNote("");
        fetchDashboardData();
      } else {
        toast.error("Failed to update mood.");
      }
    } catch (error) {
      console.error("Failed to update mood:", error);
      toast.error("Failed to update mood.");
    } finally {
      setIsSavingMood(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          projectId: "global",
          senderId: user?._id || "system",
          senderName: user?.name || "Admin",
          senderRole: user?.role || "admin",
          message: chatMessage.trim(),
          type: "text",
          timestamp: new Date(),
        }),
      });

      if (res.ok) {
        setChatMessage("");
        fetchDashboardData();
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Failed to load dashboard data
          </p>
        </div>
      </div>
    );
  }

  const {
    totalTeamMembers,
    activeProjects,
    totalLeads,
    recentNotifications,
    attendanceData,
    attendanceChartData,
    moodData,
    scheduleData,
    timelineItems,
    goalsData,
    recentFeedback,
    supportRequests,
    performanceData,
    globalChat,
    meetingsPartition,
  } = dashboardData;

  const chatMessages = (globalChat || []).slice().reverse();
  const timelineStart = new Date();
  timelineStart.setHours(0, 0, 0, 0);
  const timelineEnd = addDays(timelineStart, 30);
  const totalTimelineDays = Math.max(
    1,
    differenceInDays(timelineEnd, timelineStart)
  );

  const myTasksSorted = [...myTasks]
    .map((task) => ({ task, date: resolveTaskDate(task) }))
    .sort((a, b) => {
      const aTime = a.date ? a.date.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.date ? b.date.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    })
    .map((item) => item.task);

  const groupedGlobalTasks = (() => {
    const groups: Record<string, TaskItem[]> = {};
    const undated: TaskItem[] = [];
    globalTasks.forEach((task) => {
      const date = resolveTaskDate(task);
      if (!date) {
        undated.push(task);
        return;
      }
      const key = format(date, "yyyy-MM-dd");
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });
    return { groups, undated };
  })();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome to your admin dashboard
        </p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Total Team Members
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalTeamMembers}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Today&apos;s Attendance
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {attendanceData.present}/{attendanceData.total}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Scheduled Meetings
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {scheduleData.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Active Goals
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {goalsData.length}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Tasks
              </h2>
              <Badge variant="secondary">{myTasks.length}</Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Assigned by project managers
            </p>
          </div>
          <div className="p-6 space-y-3">
            {tasksLoading ? (
              <div className="text-sm text-muted-foreground">
                Loading tasks...
              </div>
            ) : myTasksSorted.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No tasks assigned yet.
              </div>
            ) : (
              myTasksSorted.slice(0, 5).map((task) => {
                const date = resolveTaskDate(task);
                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {date ? format(date, "MMM dd, yyyy") : "No date"}
                      </p>
                      {task.subtasks?.length ? (
                        <p className="text-[11px] text-gray-500">
                          Subtasks: {task.subtasks.length}
                        </p>
                      ) : null}
                    </div>
                    <Badge variant="outline">{task.status || "pending"}</Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Dialog open={isGlobalTasksOpen} onOpenChange={setIsGlobalTasksOpen}>
          <Card className="border-0 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Global Task Window
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Who has what assigned on which day
                </p>
              </div>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  Open
                </Button>
              </DialogTrigger>
            </div>
            <div className="p-6 space-y-3">
              {tasksLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading tasks...
                </div>
              ) : globalTasks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No global tasks found.
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {globalTasks.length} tasks across{" "}
                  {
                    new Set(
                      globalTasks.map((t) => t.assignedTo).filter(Boolean)
                    ).size
                  }{" "}
                  members
                </div>
              )}
            </div>
          </Card>

          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Global Task Window</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {tasksLoading ? (
                <div className="text-sm text-muted-foreground">
                  Loading tasks...
                </div>
              ) : globalTasks.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No tasks to display.
                </div>
              ) : (
                <>
                  {Object.keys(groupedGlobalTasks.groups)
                    .sort()
                    .map((dateKey) => {
                      const tasksForDate =
                        groupedGlobalTasks.groups[dateKey] || [];
                      return (
                        <div key={dateKey} className="space-y-2">
                          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {format(
                              new Date(`${dateKey}T00:00:00`),
                              "MMM dd, yyyy"
                            )}
                          </div>
                          <div className="space-y-2">
                            {tasksForDate.map((task) => (
                              <div
                                key={task._id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Assigned to:{" "}
                                    {usersById[task.assignedTo || ""]?.name ||
                                      task.assignedTo ||
                                      "Unassigned"}
                                  </p>
                                  {task.subtasks?.length ? (
                                    <p className="text-[11px] text-gray-500">
                                      Subtasks: {task.subtasks.length}
                                    </p>
                                  ) : null}
                                </div>
                                <Badge variant="outline">
                                  {task.status || "pending"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  {groupedGlobalTasks.undated.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        No Date
                      </div>
                      <div className="space-y-2">
                        {groupedGlobalTasks.undated.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {task.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Assigned to:{" "}
                                {usersById[task.assignedTo || ""]?.name ||
                                  task.assignedTo ||
                                  "Unassigned"}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {task.status || "pending"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar & Schedule */}
        <Card className="lg:col-span-1 border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Calendar
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                {[0, 7, 14, 21, 28].map((offset) => {
                  const labelDate = addDays(timelineStart, offset);
                  return <span key={offset}>{format(labelDate, "MMM d")}</span>;
                })}
              </div>
              {!timelineItems || timelineItems.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No upcoming milestones or meetings.
                </div>
              ) : (
                (timelineItems as TimelineItem[]).map((item) => {
                  const date = new Date(item.date);
                  const offset = Math.min(
                    totalTimelineDays,
                    Math.max(0, differenceInDays(date, timelineStart))
                  );
                  const left = (offset / totalTimelineDays) * 100;
                  const color =
                    item.type === "meeting" ? "bg-blue-500" : "bg-amber-500";
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 w-16">
                        {format(date, "MMM d")}
                      </div>
                      <div className="relative flex-1 h-5 rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`absolute top-1/2 -translate-y-1/2 h-2 rounded-full ${color}`}
                          style={{
                            left: `${Math.min(left, 96)}%`,
                            width: "4%",
                          }}
                        />
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 flex-1">
                        {item.title}
                        {item.projectName ? ` • ${item.projectName}` : ""}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Moody Board */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <Smile className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
                Team Mood
              </h2>
              <Dialog
                open={isMoodDialogOpen}
                onOpenChange={setIsMoodDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Your Mood</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mood</label>
                      <Select
                        value={selectedMood}
                        onValueChange={setSelectedMood}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ready">Ready to work</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="low">Feeling low</SelectItem>
                          <SelectItem value="rest">Need rest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Note (optional)
                      </label>
                      <Textarea
                        value={moodNote}
                        onChange={(e) => setMoodNote(e.target.value)}
                        placeholder="Share a quick note..."
                      />
                    </div>
                    <Button onClick={handleSaveMood} disabled={isSavingMood}>
                      {isSavingMood ? "Saving..." : "Save Mood"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {moodData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {moodData.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    {item.mood}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Attendance */}
        <Card className="lg:col-span-1 border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Attendance
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="present" stackId="a" fill="#10b981" />
                <Bar dataKey="absent" stackId="a" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anonymous Feedback */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Anonymous Feedback
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {(recentFeedback || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No anonymous feedback yet.
              </div>
            ) : (
              (recentFeedback || []).map((item: any, idx: number) => (
                <div
                  key={item.id || item._id || idx}
                  className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900"
                >
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Anonymous Feedback
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-2">
                    {new Date(
                      item.date || item.createdAt || Date.now()
                    ).toLocaleString()}
                  </p>
                </div>
              ))
            )}
            <Textarea
              placeholder="Submit anonymous feedback..."
              value={anonymousFeedback}
              onChange={(e) => setAnonymousFeedback(e.target.value)}
              className="text-xs"
            />
            <Button
              size="sm"
              className="w-full"
              onClick={handleAnonymousFeedback}
            >
              Submit Feedback
            </Button>
          </div>
        </Card>

        {/* Support */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Support
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {(supportRequests || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No support requests yet.
              </div>
            ) : (
              (supportRequests || []).map((item: any, idx: number) => (
                <div
                  key={item.id || item._id || idx}
                  className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-900"
                >
                  <p className="text-sm font-semibold text-red-900 dark:text-red-200">
                    Support Request
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-2">
                    {new Date(
                      item.date || item.createdAt || Date.now()
                    ).toLocaleString()}
                  </p>
                </div>
              ))
            )}
            <Textarea
              placeholder="Send a support request..."
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              className="text-xs"
            />
            <Button size="sm" className="w-full" onClick={handleSupportRequest}>
              Send Support Request
            </Button>
          </div>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Goals
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {goalsData.map((goal: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {goal.title}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    {goal.dueDate}
                  </Badge>
                </div>
                <Progress
                  value={goal.progress}
                  className="h-2 bg-gray-200 dark:bg-gray-700"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {goal.progress}% Complete
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Analytics */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Analytics
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="performance"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* My Schedule */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              My Schedule
            </h2>
          </div>
          <div className="p-6 space-y-3">
            {scheduleData.slice(0, 3).map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 min-w-16">
                  {item.time}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {item.task}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.attendees} attendees
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fourth Row - Meetings Partition & Global Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meets Partition */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <Video className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Meets Partition
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {(meetingsPartition || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No upcoming meetings.
              </div>
            ) : (
              (meetingsPartition || []).map((meeting: any) => (
                <div
                  key={meeting.id}
                  className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {meeting.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {meeting.attendees} attendees
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!meeting.meetingLink}
                    onClick={() =>
                      meeting.meetingLink &&
                      window.open(meeting.meetingLink, "_blank")
                    }
                  >
                    Join
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Global Chat */}
        <Card className="border-0 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />{" "}
              Global Chat
            </h2>
          </div>
          <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
            {chatMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No global messages yet.
              </p>
            ) : (
              chatMessages.map((msg: any) => {
                const initials = msg.senderName
                  ? msg.senderName
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "AD";
                return (
                  <div key={msg._id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {msg.senderName || "Admin"}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Input
                placeholder="Type a message..."
                className="text-xs"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
              />
              <Button size="sm" variant="ghost" onClick={handleSendChatMessage}>
                <Send className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
