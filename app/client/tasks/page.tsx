"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/loading-skeleton";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api-service";
import { getStoredUser } from "@/lib/client-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  scheduledDate: string;
  estimatedHours: number;
  tags: string[];
  dueDate: string;
  order?: number;
}

const fetchTasks = async (
  authToken: string,
  uid: string,
  projectId?: string
) => {
  const params = new URLSearchParams({
    assignedTo: uid,
    status: "scheduled,pending,in-progress",
  });
  if (projectId) params.append("projectId", projectId);

  const response = await fetch(`/api/tasks?${params}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
  const data = await response.json();
  return data?.data || [];
};

function SortableTaskCard({
  task,
  onAction,
  getPriorityColor,
  getStatusColor,
}: {
  task: Task;
  onAction: (taskId: string, action: "start" | "submit") => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-70")}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3">
            <button
              type="button"
              className="mt-1 text-muted-foreground hover:text-foreground"
              aria-label="Reorder task"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div>
              <h3 className="font-bold text-lg">{task.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {task.description}
              </p>
            </div>
          </div>
          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
            {task.priority.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Scheduled:</span>
            <p>
              {task.scheduledDate
                ? format(new Date(task.scheduledDate), "MMM dd, yyyy")
                : "TBD"}
            </p>
          </div>
          <div>
            <span className="font-medium">Due:</span>
            <p>
              {task.dueDate ? format(new Date(task.dueDate), "MMM dd") : "TBD"}
            </p>
          </div>
          <div>
            <span className="font-medium">Estimated:</span>
            <p>{task.estimatedHours}h</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
          </div>
        </div>

        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          {(task.status === "scheduled" || task.status === "pending") && (
            <Button
              onClick={() => onAction(task._id, "start")}
              className="flex-1"
            >
              Start Task
            </Button>
          )}
          {task.status === "in-progress" && (
            <Button
              onClick={() => onAction(task._id, "submit")}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Submit for Review
            </Button>
          )}
          <Link href={`/client/tasks/${task._id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("user");
    if (!storedToken || !userStr) {
      router.push("/auth/login");
      return;
    }
    const user = JSON.parse(userStr);
    setToken(storedToken);
    setUserId(user._id);

    // Load projects
    const loadProjects = async () => {
      try {
        const projectsData = await apiService.getProjects({
          clientId: user.clientId,
        });
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    loadProjects();
  }, [router]);

  const { data, isLoading, mutate } = useSWR(
    token && userId ? ["client-tasks", token, userId, selectedProjectId] : null,
    () =>
      fetchTasks(
        token as string,
        userId as string,
        selectedProjectId || undefined
      )
  );

  useEffect(() => {
    if (data) setTasks(data as Task[]);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const persistOrder = async (ordered: Task[]) => {
    if (!token) return;
    setIsReordering(true);
    try {
      const response = await fetch("/api/tasks/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderedIds: ordered.map((task) => task._id) }),
      });

      if (!response.ok) {
        toast.error("Failed to save task order");
        return;
      }
      toast.success("Task order updated");
      mutate();
    } catch (error) {
      console.error("Failed to reorder tasks:", error);
      toast.error("Failed to save task order");
    } finally {
      setIsReordering(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTasks((items) => {
      const oldIndex = items.findIndex((task) => task._id === active.id);
      const newIndex = items.findIndex((task) => task._id === over.id);
      const updated = arrayMove(items, oldIndex, newIndex);
      void persistOrder(updated);
      return updated;
    });
  };

  const handleAction = async (taskId: string, action: "start" | "submit") => {
    if (!token) return;
    try {
      const response = await fetch(`/api/tasks/${taskId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(
          action === "start" ? "Task started" : "Task submitted for review"
        );
        mutate();
      } else {
        toast.error("Failed to update task");
      }
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-sky-100 text-sky-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-muted rounded animate-pulse" />
            <div className="h-4 w-28 bg-muted rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Tasks</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Live tasks only</Badge>
          {isReordering && (
            <span className="text-xs text-muted-foreground">Saving order…</span>
          )}
        </div>
      </div>

      {/* Project Filter */}
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium">Filter by Project:</Label>
        <Select
          value={selectedProjectId || "all"}
          onValueChange={(value) =>
            setSelectedProjectId(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext
          items={tasks.map((task) => task._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-4">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No tasks assigned to you today.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back later or contact your project manager.
                  </p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <SortableTaskCard
                  key={task._id}
                  task={task}
                  onAction={handleAction}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
