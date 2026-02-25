"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Project {
  _id: string;
  name: string;
  clientId: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  milestones?: {
    id?: string;
    name?: string;
    status?: string;
    dueDate?: string;
  }[];
}

interface Milestone {
  id?: string;
  name?: string;
  status?: string;
  dueDate?: string;
}

interface DocumentItem {
  _id?: string;
  title: string;
  type: string;
}

interface TaskItem {
  _id?: string;
  title: string;
  status?: string;
}

export default function ProjectDetailPage() {
  const pathname = usePathname();
  const id = pathname?.split("/").pop() || "";
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`);
        const json = await res.json();
        setProject(json.data || json || null);
        const proj = json.data || json || null;
        setMilestones(proj?.milestones || []);
      } catch (e) {
        console.error("Failed to load project", e);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!project) return;
    const loadRelated = async () => {
      try {
        const [docsRes, tasksRes] = await Promise.all([
          fetch(`/api/documents?projectId=${project._id}`),
          fetch(`/api/tasks?projectId=${project._id}`),
        ]);
        const docsJson = await docsRes.json();
        const tasksJson = await tasksRes.json();
        setDocuments(docsJson.data || []);
        setTasks(tasksJson.data || []);
      } catch (e) {
        console.error("Failed to load related data", e);
      }
    };
    loadRelated();
  }, [project]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <nav className="text-sm text-muted-foreground mb-2">
          <Link href="/admin/projects" className="text-primary">
            Projects
          </Link>
          <span className="mx-2">/</span>
          <span>{project?.name || id}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project?.name || "Project"}</h1>
            <p className="text-sm text-muted-foreground">{project?.clientId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Edit Project</Button>
            <Button>Actions</Button>
          </div>
        </div>
      </div>

      <div className="flex space-x-2">
        {[
          "overview",
          "pipelines",
          "documents",
          "milestones",
          "tasks",
          "team",
        ].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 rounded-md text-sm ${
              activeTab === t
                ? "bg-primary text-white"
                : "bg-muted/10 text-muted-foreground"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "overview" && (
          <Card className="p-6">
            <h3 className="font-semibold">Overview</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Status: {project?.status}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Progress: {project?.progress}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Budget: {project?.budget}
            </p>
          </Card>
        )}

        {activeTab === "pipelines" && (
          <Card className="p-6">
            <h3 className="font-semibold">Time Pipelines</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Use milestones and tasks to build pipelines.
            </p>
            <div className="mt-4 space-y-2">
              {milestones.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No milestones defined.
                </div>
              )}
              {milestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.name || ""}</div>
                    <div className="text-xs text-muted-foreground">
                      Due:{" "}
                      {m.dueDate
                        ? new Date(m.dueDate).toLocaleDateString()
                        : "—"}
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-3 flex gap-2">
                <input
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  placeholder="Milestone title"
                  className="input"
                />
                <Button
                  onClick={async () => {
                    if (!newMilestoneTitle || !project) return;
                    const newMilestone = {
                      id: `ms-${Date.now()}`,
                      name: newMilestoneTitle,
                      status: "pending",
                    };
                    const updated = {
                      ...project,
                      milestones: [...(project.milestones || []), newMilestone],
                    };
                    const res = await fetch(`/api/projects?id=${project._id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(updated),
                    });
                    if (res.ok) {
                      setMilestones((s) => [...s, newMilestone]);
                      setNewMilestoneTitle("");
                      setProject(updated);
                    }
                  }}
                >
                  Add Milestone
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "documents" && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Documents</h3>
              <div className="flex items-center gap-2">
                <input
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document title"
                  className="input"
                />
                <Button
                  onClick={async () => {
                    if (!newDocTitle || !project) return;
                    const docPayload = {
                      projectId: project._id,
                      type: "custom",
                      title: newDocTitle,
                      status: "draft",
                      data: {},
                    };
                    const res = await fetch("/api/documents", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(docPayload),
                    });
                    if (res.ok) {
                      const j = await res.json();
                      setDocuments((d) => [...d, j.data]);
                      setNewDocTitle("");
                    }
                  }}
                >
                  Create
                </Button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {documents.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No documents yet.
                </div>
              )}
              {documents.map((doc) => (
                <div key={doc._id} className="p-2 border rounded">
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Type: {doc.type}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "milestones" && (
          <Card className="p-6">
            <h3 className="font-semibold">Milestones</h3>
            <div className="mt-4 space-y-2">
              {milestones.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No milestones.
                </div>
              )}
              {milestones.map((m) => (
                <div
                  key={m.id || m.name}
                  className="p-2 border rounded flex justify-between"
                >
                  <div>
                    <div className="font-medium">{m.name || ""}</div>
                    <div className="text-xs text-muted-foreground">
                      Status: {m.status || "pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "tasks" && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tasks</h3>
              <div className="flex items-center gap-2">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title"
                  className="input"
                />
                <Button
                  onClick={async () => {
                    if (!newTaskTitle || !project) return;
                    const payload = {
                      projectId: project._id,
                      title: newTaskTitle,
                      status: "pending",
                      assignedTo: "",
                    };
                    const res = await fetch("/api/tasks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    if (res.ok) {
                      const j = await res.json();
                      setTasks((t) => [...t, j.data]);
                      setNewTaskTitle("");
                    }
                  }}
                >
                  Create Task
                </Button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {tasks.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No tasks yet.
                </div>
              )}
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-2 border rounded flex justify-between"
                >
                  <div>
                    <div className="font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      Status: {task.status || "pending"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === "team" && (
          <Card className="p-6">Project team and roles management.</Card>
        )}
      </div>
    </div>
  );
}
