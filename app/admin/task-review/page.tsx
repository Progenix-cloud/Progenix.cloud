"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User } from "lucide-react";
import { format } from "date-fns";
import { useAuthSession, ROLES } from "@/lib/hooks/useAuthSession";
import { buildAuthHeaders } from "@/lib/client-auth";

interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  status: string;
  priority: string;
  scheduledDate: string;
  submittedDate: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  createdBy: string;
}

export default function TaskReviewPage() {
  const {
    user,
    loading: authLoading,
    error: authError,
    hasRole,
  } = useAuthSession();
  const [isPM, setIsPM] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && hasRole([ROLES.PROJECT_MANAGER])) {
      setIsPM(true);
      fetchSubmittedTasks();
    } else if (user) {
      setIsPM(false);
    }
  }, [user, hasRole]);

  const fetchSubmittedTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/tasks?status=submitted", {
        headers: buildAuthHeaders(),
      });
      const data = await response.json();
      if (data.success) {
        // Add user names to tasks
        const tasksWithNames = await Promise.all(
          data.data.map(async (task: Task) => {
            try {
              const userResponse = await fetch(
                `/api/users/${task.assignedTo}`,
                {
                  headers: buildAuthHeaders(),
                }
              );
              const userData = await userResponse.json();
              return {
                ...task,
                assignedToName: userData.success
                  ? userData.data.name
                  : "Unknown User",
              };
            } catch {
              return { ...task, assignedToName: "Unknown User" };
            }
          })
        );
        setTasks(tasksWithNames);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const reviewTask = async (taskId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/review`, {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ approved, notes: reviewNotes }),
      });

      if (response.ok) {
        if (approved) {
          const completeResponse = await fetch(
            `/api/tasks/${taskId}/complete`,
            {
              method: "POST",
              headers: buildAuthHeaders(),
            }
          );
          if (!completeResponse.ok) {
            console.error("Failed to complete task after review");
          }
        }
        setSelectedTask(null);
        setReviewNotes("");
        fetchSubmittedTasks();
      }
    } catch (error) {
      console.error("Failed to review task:", error);
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
        {authError ? `Auth error: ${authError}` : "Loading..."}
      </div>
    );
  }

  if (authError || !isPM) {
    return (
      <div className="p-8 text-center">Unauthorized (Project Manager only)</div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Task Review Dashboard</h1>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {tasks.length} tasks pending review
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Submitted Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No tasks pending review
                  </p>
                ) : (
                  tasks.map((task) => (
                    <div
                      key={task._id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge
                          className={`text-xs ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {task.assignedToName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.submittedDate &&
                            format(
                              new Date(task.submittedDate),
                              "MMM dd, HH:mm"
                            )}
                        </div>
                      </div>
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Task Details & Review</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedTask.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {selectedTask.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Assigned to:</span>
                      <p>{selectedTask.assignedToName}</p>
                    </div>
                    <div>
                      <span className="font-medium">Priority:</span>
                      <p
                        className={`font-medium ${getPriorityColor(selectedTask.priority)}`}
                      >
                        {selectedTask.priority.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Scheduled:</span>
                      <p>
                        {selectedTask.scheduledDate &&
                          format(
                            new Date(selectedTask.scheduledDate),
                            "MMM dd, yyyy"
                          )}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <p>
                        {selectedTask.submittedDate &&
                          format(
                            new Date(selectedTask.submittedDate),
                            "MMM dd, HH:mm"
                          )}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Estimated Hours:</span>
                      <p>{selectedTask.estimatedHours}h</p>
                    </div>
                    <div>
                      <span className="font-medium">Actual Hours:</span>
                      <p>{selectedTask.actualHours || "Not specified"}h</p>
                    </div>
                  </div>

                  {selectedTask.tags.length > 0 && (
                    <div>
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedTask.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                    <Textarea
                      id="reviewNotes"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add any feedback or notes about this task..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => reviewTask(selectedTask._id, true)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Complete
                    </Button>
                    <Button
                      onClick={() => reviewTask(selectedTask._id, false)}
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Send Back
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select a task to review
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {tasks.length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter((t) => t.priority === "high").length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tasks.filter((t) => t.scheduledDate).length}
              </div>
              <div className="text-sm text-gray-600">Scheduled Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {
                  tasks.filter(
                    (t) => t.actualHours && t.actualHours <= t.estimatedHours
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">On Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
