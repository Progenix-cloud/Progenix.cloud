"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Clock, Plus, Search } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { apiService } from "@/lib/api-service";
import { buildAuthHeaders, getStoredClientId } from "@/lib/client-auth";
import { toast } from "sonner";

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  submittedDate: string;
  description?: string;
  projectId?: string;
}

export default function SupportPage() {
  // tickets and loading handled by SWR above
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [userClientId, setUserClientId] = useState("");

  const [projectId, setProjectId] = useState<string | null>(null);
  const [formProjectId, setFormProjectId] = useState("");

  const resolvedClientId = userClientId || getStoredClientId();

  const { data: projects = [], isValidating: projectsValidating } = useSWR(
    resolvedClientId ? ["projects", resolvedClientId] : null,
    () => apiService.getProjects({ clientId: resolvedClientId as string }),
    { revalidateOnFocus: false }
  );

  const ticketsKey = resolvedClientId
    ? ["change-requests", resolvedClientId, projectId || "all"]
    : null;
  const {
    data: ticketsRaw = [],
    isLoading: ticketsLoading,
    mutate,
  } = useSWR(ticketsKey, () =>
    apiService.getChangeRequests({
      clientId: resolvedClientId as string,
      ...(projectId && { projectId: projectId as string }),
    })
  );

  const tickets: Ticket[] = ticketsRaw.map((cr: any) => ({
    id: cr.id || cr._id || `CR-${Date.now()}`,
    title: cr.title,
    status: cr.status,
    priority: cr.estimatedEffort === "high" ? "high" : "medium",
    submittedDate: cr.submittedDate || cr.createdAt,
    description: cr.description,
    projectId: cr.projectId,
  }));

  const isLoading = !resolvedClientId || ticketsLoading || projectsValidating;

  // loadTickets replaced with SWR

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserClientId(user.clientId);
    }
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resolvedClientId = userClientId || getStoredClientId();
      if (!resolvedClientId) {
        toast.error("Missing client session");
        return;
      }
      if (!formProjectId) {
        toast.error("Please select a project");
        return;
      }
      const formData = new FormData(e.target as HTMLFormElement);
      const payload = {
        clientId: resolvedClientId,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        projectId: formProjectId,
        type: "support",
        status: "pending",
        estimatedEffort:
          formData.get("priority") === "High" ? "high" : "medium",
      };
      const response = await fetch("/api/change-requests", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setIsOpen(false);
        (e.target as HTMLFormElement).reset();
        setFormProjectId("");
        mutate();
        toast.success("Support request submitted");
      } else {
        const err = await response.json();
        toast.error(err?.error || "Failed to submit support request");
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
      toast.error("Failed to submit support request");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "implemented":
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, any> = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    };
    return colors[priority] || "outline";
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support & Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all support requests and technical issues
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue in detail so our team can help you quickly.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Issue Title"
                  className="w-full px-3 py-2 border rounded mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  name="priority"
                  className="w-full px-3 py-2 border rounded mt-1"
                  required
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Project *</label>
                <Select value={formProjectId} onValueChange={setFormProjectId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project: any) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  placeholder="Detailed Description"
                  className="w-full px-3 py-2 border rounded h-24 mt-1"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Label className="text-sm font-medium">Filter by Project:</Label>
        <Select
          value={projectId || ""}
          onValueChange={(value) => setProjectId(value || null)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Projects</SelectItem>
            {projects.map((project: any) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading tickets...</p>
          ) : filteredTickets.length === 0 ? (
            <p>No tickets found</p>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-mono text-sm font-semibold text-muted-foreground">
                        {ticket.id}
                      </span>
                      <h3 className="font-semibold">{ticket.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created:{" "}
                      {new Date(ticket.submittedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Badge variant={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline">{ticket.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
