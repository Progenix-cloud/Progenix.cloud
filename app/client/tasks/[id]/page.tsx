"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  scheduledDate?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  createdBy?: string;
}

export default function ClientTaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (!storedToken) {
      router.push("/auth/login");
      return;
    }
    setToken(storedToken);
    loadTask(storedToken);
  }, [router, taskId]);

  const loadTask = async (authToken: string) => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const json = await res.json();
      if (json.success) {
        setTask(json.data);
      }
    } catch (error) {
      console.error("Failed to load task:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "start" | "submit") => {
    if (!taskId || !token) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok && token) {
        loadTask(token);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading task...</div>;
  }

  if (!task) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" onClick={() => router.push("/client/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Task not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/client/tasks")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tasks
        </Button>
        <Badge variant="outline">{task.status}</Badge>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-sm text-muted-foreground">{task.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
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
                {task.dueDate
                  ? format(new Date(task.dueDate), "MMM dd, yyyy")
                  : "TBD"}
              </p>
            </div>
            <div>
              <span className="font-medium">Estimated:</span>
              <p>{task.estimatedHours || 0}h</p>
            </div>
            <div>
              <span className="font-medium">Priority:</span>
              <p className="capitalize">{task.priority}</p>
            </div>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            {task.status === "pending" && (
              <Button onClick={() => handleAction("start")}>Start Task</Button>
            )}
            {task.status === "in-progress" && (
              <Button
                onClick={() => handleAction("submit")}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit for Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
