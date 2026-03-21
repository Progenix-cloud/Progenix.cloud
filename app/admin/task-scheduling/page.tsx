"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthSession, ROLES } from "@/lib/hooks/useAuthSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek } from "date-fns";
import { buildAuthHeaders } from "@/lib/client-auth";

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
  priority: string;
  scheduledDate: string;
  dueDate: string;
  estimatedHours: number;
  tags: string[];
  createdBy: string;
  subtasks?: {
    id?: string;
    title?: string;
    status?: string;
  }[];
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface TaskTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  estimatedHours: number;
  tags: string[];
}

export default function TaskSchedulingPage() {
  const {
    user,
    loading: authLoading,
    error: authError,
    hasRole,
  } = useAuthSession();

  const isPM = hasRole([ROLES.PROJECT_MANAGER]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium",
    estimatedHours: 0,
    tags: [] as string[],
  });

  const [templateAssignments, setTemplateAssignments] = useState({
    templateIds: [] as string[],
    assignments: [] as { userId: string; date: Date }[],
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch tasks for the selected week
      const weekStart = startOfWeek(selectedDate);
      const weekEnd = endOfWeek(selectedDate);

      const [tasksRes, usersRes, templatesRes] = await Promise.all([
        fetch(
          `/api/tasks?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`,
          { headers: buildAuthHeaders() }
        ),
        fetch("/api/users", { headers: buildAuthHeaders() }),
        fetch("/api/task-templates", { headers: buildAuthHeaders() }),
      ]);

      const [tasksData, usersData, templatesData] = await Promise.all([
        tasksRes.json(),
        usersRes.json(),
        templatesRes.json(),
      ]);

      if (tasksData.success) setTasks(tasksData.data);
      if (usersData.success) setUsers(usersData.data);
      if (templatesData.success) setTemplates(templatesData.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (isPM) {
      fetchData();
    }
  }, [fetchData, isPM]);

  const createTask = async () => {
    try {
      if (!newTask.title.trim()) {
        alert("Title is required");
        return;
      }

      const taskData = {
        ...newTask,
        scheduledDate: selectedDate.toISOString(),
        dueDate: addDays(selectedDate, 1).toISOString(),
        status: "scheduled",
        tags: newTask.tags.filter((tag) => tag.trim() !== ""),
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ tasks: [taskData] }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsCreateDialogOpen(false);
        setNewTask({
          title: "",
          description: "",
          assignedTo: "",
          priority: "medium",
          estimatedHours: 0,
          tags: [],
        });
        fetchData();
      } else {
        alert(`Failed to create task: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const createTasksFromTemplates = async () => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          templateIds: templateAssignments.templateIds,
          assignments: templateAssignments.assignments.map((a) => ({
            userId: a.userId,
            date: a.date.toISOString(),
          })),
        }),
      });

      if (response.ok) {
        setIsTemplateDialogOpen(false);
        setTemplateAssignments({
          templateIds: [],
          assignments: [],
        });
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create tasks from templates:", error);
    }
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) =>
        task.scheduledDate &&
        format(new Date(task.scheduledDate), "yyyy-MM-dd") ===
          format(date, "yyyy-MM-dd")
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        {authError ? "Auth error: " + authError : "Loading..."}
      </div>
    );
  }

  if (authError || !isPM) {
    return <div className="p-8 text-center">Unauthorized</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Scheduling Dashboard</h1>
        <div className="flex gap-2">
          <Dialog
            open={isTemplateDialogOpen}
            onOpenChange={setIsTemplateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                From Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Tasks from Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Templates</Label>
                  <Select
                    value={templateAssignments.templateIds.join(",")}
                    onValueChange={(value) =>
                      setTemplateAssignments((prev) => ({
                        ...prev,
                        templateIds: value.split(",").filter(Boolean),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose templates" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assignments</Label>
                  <div className="space-y-2">
                    {templateAssignments.assignments.map(
                      (assignment, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Select
                            value={assignment.userId}
                            onValueChange={(userId) =>
                              setTemplateAssignments((prev) => ({
                                ...prev,
                                assignments: prev.assignments.map((a, i) =>
                                  i === index ? { ...a, userId } : a
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map((user) => (
                                <SelectItem key={user._id} value={user._id}>
                                  {user.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            min={format(new Date(), "yyyy-MM-dd")}
                            max={format(addDays(new Date(), 7), "yyyy-MM-dd")}
                            value={format(assignment.date, "yyyy-MM-dd")}
                            onChange={(e) => {
                              const date = new Date(e.target.value);
                              if (date <= addDays(new Date(), 7)) {
                                setTemplateAssignments((prev) => ({
                                  ...prev,
                                  assignments: prev.assignments.map((a, i) =>
                                    i === index ? { ...a, date } : a
                                  ),
                                }));
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setTemplateAssignments((prev) => ({
                                ...prev,
                                assignments: prev.assignments.filter(
                                  (_, i) => i !== index
                                ),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    )}
                    <Button
                      variant="outline"
                      onClick={() =>
                        setTemplateAssignments((prev) => ({
                          ...prev,
                          assignments: [
                            ...prev.assignments,
                            { userId: "", date: selectedDate },
                          ],
                        }))
                      }
                    >
                      Add Assignment
                    </Button>
                  </div>
                </div>
                <Button onClick={createTasksFromTemplates} className="w-full">
                  Create Tasks
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({ ...prev, assignedTo: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask((prev) => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={newTask.estimatedHours}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        estimatedHours: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={newTask.tags.join(", ")}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      }))
                    }
                  />
                </div>
                <Button onClick={createTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Task Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
                modifiers={{
                  hasTasks: tasks
                    .map((task) => new Date(task.scheduledDate))
                    .filter(Boolean),
                }}
                modifiersStyles={{
                  hasTasks: { backgroundColor: "#dbeafe", color: "#1e40af" },
                }}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                Tasks for {format(selectedDate, "MMM dd, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTasksForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No tasks scheduled
                  </p>
                ) : (
                  getTasksForDate(selectedDate).map((task) => (
                    <div
                      key={task._id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{task.title}</h4>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                      {task.subtasks?.length ? (
                        <p className="text-xs text-gray-500">
                          Subtasks: {task.subtasks.length}
                        </p>
                      ) : null}
                      <div className="flex justify-between items-center text-sm">
                        <span
                          className={`font-medium ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                        <span>{task.estimatedHours}h</span>
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.filter((t) => t.status === "in-progress").length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tasks.filter((t) => t.status === "submitted").length}
              </div>
              <div className="text-sm text-gray-600">Submitted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter((t) => t.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
