"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { buildAuthHeaders } from "@/lib/client-auth";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Project {
  _id: string;
  name: string;
  clientId: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  description?: string;
  teamMembers?: string[];
  teamMembersCount?: number;
  teamId?: string;
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
  subtasks?: {
    id?: string;
    title?: string;
    status?: string;
  }[];
}

interface MeetingItem {
  _id?: string;
  title?: string;
  date?: string;
  status?: string;
}

interface MessageItem {
  _id?: string;
  message?: string;
  senderName?: string;
  timestamp?: string;
}

interface InvoiceItem {
  _id?: string;
  invoiceNumber?: string;
  amount?: number;
  status?: string;
}

interface ChangeRequestItem {
  _id?: string;
  title?: string;
  status?: string;
}

interface SupportTicket {
  _id?: string;
  message?: string;
  date?: string;
}

interface TeamItem {
  _id?: string;
  members?: Array<{ userId: string; role?: string }>;
}

export default function ProjectDetailPage() {
  const pathname = usePathname();
  const id = pathname?.split("/").pop() || "";
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [changeRequests, setChangeRequests] = useState<ChangeRequestItem[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newDocTitle, setNewDocTitle] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    status: "",
    budget: 0,
    spent: 0,
  });

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
          headers: buildAuthHeaders(),
        });
        const json = await res.json();
        setProject(json.data || json || null);
        const proj = json.data || json || null;
        setMilestones(proj?.milestones || []);
        // Populate edit form
        if (proj) {
          setEditFormData({
            name: proj.name || "",
            status: proj.status || "",
            budget: proj.budget || 0,
            spent: proj.spent || 0,
          });
        }
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
        const [
          docsRes,
          tasksRes,
          meetingsRes,
          messagesRes,
          invoicesRes,
          changesRes,
          supportRes,
          teamsRes,
        ] = await Promise.all([
          fetch(`/api/documents?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
          fetch(`/api/tasks?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
          fetch(`/api/meetings?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
          fetch(`/api/messages?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
          fetch(`/api/invoices?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
          fetch(`/api/change-requests?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
          fetch(
            `/api/feedback?category=support&projectId=${project._id}`,
            {
              headers: buildAuthHeaders(),
            }
          ),
          fetch(`/api/client-team?projectId=${project._id}`, {
            headers: buildAuthHeaders(),
          }),
        ]);

        const [
          docsJson,
          tasksJson,
          meetingsJson,
          messagesJson,
          invoicesJson,
          changesJson,
          supportJson,
          teamsJson,
        ] = await Promise.all([
          docsRes.json(),
          tasksRes.json(),
          meetingsRes.json(),
          messagesRes.json(),
          invoicesRes.json(),
          changesRes.json(),
          supportRes.json(),
          teamsRes.json(),
        ]);

        setDocuments(docsJson.data || []);
        setTasks(tasksJson.data || []);
        setMeetings(meetingsJson.data || []);
        setMessages(messagesJson.data || []);
        setInvoices(invoicesJson.data || []);
        setChangeRequests(changesJson.data || []);
        setSupportTickets(supportJson.data || []);
        setTeams(teamsJson.data || []);
      } catch (e) {
        console.error("Failed to load related data", e);
      }
    };
    loadRelated();
  }, [project]);

  const updateProjectStatus = async (status: string) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects?id=${project._id}`, {
        method: "PUT",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated.data);
        setEditFormData((prev) => ({ ...prev, status }));
      }
    } catch (error) {
      console.error("Failed to update project status:", error);
    }
  };

  const teamMemberCount =
    teams?.[0]?.members?.length ||
    project?.teamMembersCount ||
    project?.teamMembers?.length ||
    0;

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
            <Button
              variant="outline"
              onClick={() => setIsEditingProject(!isEditingProject)}
            >
              {isEditingProject ? "Cancel Edit" : "Edit Project"}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => updateProjectStatus("planning")}>
                  Set Planning
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateProjectStatus("in-progress")}
                >
                  Set In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateProjectStatus("on-hold")}>
                  Set On Hold
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updateProjectStatus("completed")}>
                  Set Completed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isEditingProject && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Edit Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Budget</label>
                <input
                  type="number"
                  value={editFormData.budget}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      budget: Number(e.target.value),
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Spent</label>
                <input
                  type="number"
                  value={editFormData.spent}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      spent: Number(e.target.value),
                    }))
                  }
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!project) return;
                  try {
                    const res = await fetch(`/api/projects?id=${project._id}`, {
                      method: "PUT",
                      headers: buildAuthHeaders({
                        "Content-Type": "application/json",
                      }),
                      body: JSON.stringify(editFormData),
                    });
                    if (res.ok) {
                      const updated = await res.json();
                      setProject(updated.data);
                      setIsEditingProject(false);
                    }
                  } catch (error) {
                    console.error("Failed to update project:", error);
                  }
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditingProject(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex space-x-2">
        {[
          "overview",
          "activity",
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
              {project?.description || "No description provided."}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Status: {project?.status}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Progress: {project?.progress}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Budget: {project?.budget}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Spent: {project?.spent}
            </p>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Meetings</div>
                <div className="font-semibold">{meetings.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Documents</div>
                <div className="font-semibold">{documents.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Messages</div>
                <div className="font-semibold">{messages.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Milestones</div>
                <div className="font-semibold">{milestones.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Tasks</div>
                <div className="font-semibold">{tasks.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Team Members</div>
                <div className="font-semibold">{teamMemberCount}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">Invoices</div>
                <div className="font-semibold">{invoices.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">
                  Change Requests
                </div>
                <div className="font-semibold">{changeRequests.length}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-xs text-muted-foreground">
                  Support Tickets
                </div>
                <div className="font-semibold">{supportTickets.length}</div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "activity" && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold">Meetings</h3>
              {meetings.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  No meetings yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {meetings.slice(0, 5).map((m) => (
                    <div key={m._id} className="p-2 border rounded">
                      <div className="font-medium">{m.title || "Meeting"}</div>
                      <div className="text-xs text-muted-foreground">
                        {m.date ? new Date(m.date).toLocaleString() : "TBD"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Messages</h3>
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  No messages yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {messages.slice(0, 5).map((msg) => (
                    <div key={msg._id} className="p-2 border rounded">
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {msg.senderName || "Unknown"} •{" "}
                        {msg.timestamp
                          ? new Date(msg.timestamp).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Invoices</h3>
              {invoices.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  No invoices yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {invoices.slice(0, 5).map((inv) => (
                    <div key={inv._id} className="p-2 border rounded">
                      <div className="font-medium">
                        {inv.invoiceNumber || inv._id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Amount: {inv.amount || 0} • Status:{" "}
                        {inv.status || "pending"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Change Requests</h3>
              {changeRequests.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  No change requests yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {changeRequests.slice(0, 5).map((cr) => (
                    <div key={cr._id} className="p-2 border rounded">
                      <div className="font-medium">{cr.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Status: {cr.status || "pending"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold">Support Tickets</h3>
              {supportTickets.length === 0 ? (
                <div className="text-sm text-muted-foreground mt-2">
                  No support tickets yet.
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  {supportTickets.slice(0, 5).map((ticket) => (
                    <div key={ticket._id} className="p-2 border rounded">
                      <div className="text-sm">{ticket.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {ticket.date
                          ? new Date(ticket.date).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <input
                  type="date"
                  value={newMilestoneDueDate}
                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  className="input"
                />
                <Button
                  onClick={async () => {
                    if (!newMilestoneTitle || !project) return;
                    const newMilestone = {
                      id: `ms-${Date.now()}`,
                      name: newMilestoneTitle,
                      status: "pending",
                      ...(newMilestoneDueDate
                        ? {
                            dueDate: new Date(
                              newMilestoneDueDate
                            ).toISOString(),
                          }
                        : {}),
                    };
                    const updated = {
                      ...project,
                      milestones: [...(project.milestones || []), newMilestone],
                    };
                    const res = await fetch(`/api/projects?id=${project._id}`, {
                      method: "PUT",
                      headers: buildAuthHeaders({
                        "Content-Type": "application/json",
                      }),
                      body: JSON.stringify(updated),
                    });
                    if (res.ok) {
                      setMilestones((s) => [...s, newMilestone]);
                      setNewMilestoneTitle("");
                      setNewMilestoneDueDate("");
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
                      headers: buildAuthHeaders({
                        "Content-Type": "application/json",
                      }),
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
                    <div className="text-xs text-muted-foreground">
                      Due:{" "}
                      {m.dueDate
                        ? new Date(m.dueDate).toLocaleDateString()
                        : "—"}
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
                <input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add subtask"
                  className="input"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!newSubtaskTitle.trim()) return;
                    setNewSubtasks((s) => [...s, newSubtaskTitle.trim()]);
                    setNewSubtaskTitle("");
                  }}
                >
                  Add Subtask
                </Button>
                <Button
                  onClick={async () => {
                    if (!newTaskTitle || !project) return;
                    const subtasksPayload = newSubtasks.map((title, idx) => ({
                      id: `sub-${Date.now()}-${idx}`,
                      title,
                      status: "pending",
                    }));
                    const payload = {
                      projectId: project._id,
                      title: newTaskTitle,
                      status: "pending",
                      assignedTo: "",
                      subtasks: subtasksPayload,
                    };
                    const res = await fetch("/api/tasks", {
                      method: "POST",
                      headers: buildAuthHeaders({
                        "Content-Type": "application/json",
                      }),
                      body: JSON.stringify(payload),
                    });
                    if (res.ok) {
                      const j = await res.json();
                      const created = Array.isArray(j.data) ? j.data : [j.data];
                      setTasks((t) => [...t, ...created.filter(Boolean)]);
                      setNewTaskTitle("");
                      setNewSubtasks([]);
                    } else {
                      const err = await res.json().catch(() => ({}));
                      toast.error(err?.message || "Failed to create task");
                    }
                  }}
                >
                  Create Task
                </Button>
              </div>
              {newSubtasks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newSubtasks.map((subtask, idx) => (
                    <Badge
                      key={`${subtask}-${idx}`}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() =>
                        setNewSubtasks((s) => s.filter((_, i) => i !== idx))
                      }
                    >
                      {subtask} x
                    </Badge>
                  ))}
                </div>
              )}
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
                    {task.subtasks?.length ? (
                      <div className="text-xs text-muted-foreground">
                        Subtasks: {task.subtasks.length}
                      </div>
                    ) : null}
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
