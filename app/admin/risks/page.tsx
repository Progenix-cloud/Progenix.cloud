"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, PlusCircle, Loader2 } from "lucide-react";
import { buildAuthHeaders } from "@/lib/client-auth";
import { apiService } from "@/lib/api-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Risk {
  _id: string;
  title: string;
  projectId: string;
  projectName?: string;
  severity: string;
  status: string;
  dueDate?: string;
  owner: string;
  ownerName?: string;
}

interface Issue {
  _id: string;
  title: string;
  projectId: string;
  projectName?: string;
  severity: string;
  status: string;
  assignee: string;
  assigneeName?: string;
  dueDate?: string;
}

interface Project {
  _id: string;
  name: string;
}

export default function RisksPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    severity: "medium",
    status: "open",
    dueDate: "",
  });

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await apiService.getProjects();
        setProjects(data);
        if (!selectedProjectId && data.length > 0) {
          setSelectedProjectId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedProjectId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedProjectId) params.append("projectId", selectedProjectId);
      const risksResponse = await fetch(`/api/risks?${params.toString()}`, {
        headers: buildAuthHeaders(),
      });

      const risksData = await risksResponse.json();

      if (risksData.success) {
        // Add project names to risks
        const risksWithNames = await Promise.all(
          risksData.data.map(async (risk: Risk) => {
            try {
              const projectResponse = await fetch(
                `/api/projects?id=${encodeURIComponent(risk.projectId)}`,
                { headers: buildAuthHeaders() }
              );
              const projectData = await projectResponse.json();
              return {
                ...risk,
                projectName: projectData.success
                  ? projectData.data.name
                  : "Unknown Project",
              };
            } catch {
              return { ...risk, projectName: "Unknown Project" };
            }
          })
        );
        setRisks(risksWithNames);
        // For now, use risks as issues too
        setIssues(
          risksWithNames.map((risk) => ({
            ...risk,
            assignee: risk.owner,
            assigneeName: risk.ownerName || risk.owner,
          }))
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    const projectId = selectedProjectId;
    if (!projectId) {
      alert("Please select a project");
      return;
    }
    if (!newIssue.title.trim()) {
      alert("Please enter a title");
      return;
    }
    try {
      const res = await fetch("/api/risks", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          projectId,
          title: newIssue.title.trim(),
          description: newIssue.description.trim(),
          severity: newIssue.severity,
          status: newIssue.status,
          dueDate: newIssue.dueDate || undefined,
        }),
      });
      if (res.ok) {
        setIsReportOpen(false);
        setNewIssue({
          title: "",
          description: "",
          severity: "medium",
          status: "open",
          dueDate: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create issue");
      }
    } catch (error) {
      console.error("Failed to create issue:", error);
      alert("Failed to create issue");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-700";
      case "high":
        return "bg-orange-500/20 text-orange-700";
      case "medium":
        return "bg-yellow-500/20 text-yellow-700";
      default:
        return "bg-green-500/20 text-green-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500/20 text-red-700";
      case "in-progress":
        return "bg-blue-500/20 text-blue-700";
      case "resolved":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Risks & Issues
            </h1>
            <p className="text-muted-foreground mt-2">
              Track project risks and resolve issues
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading risks and issues...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Risks & Issues
            </h1>
            <p className="text-muted-foreground mt-2">
              Track project risks and resolve issues
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading data</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risks & Issues</h1>
          <p className="text-muted-foreground mt-2">
            Track project risks and resolve issues
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedProjectId}
            onValueChange={setSelectedProjectId}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={() => setIsReportOpen(true)}>
            <PlusCircle className="h-4 w-4" />
            Report Issue
          </Button>
        </div>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newIssue.title}
                onChange={(e) =>
                  setNewIssue((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Issue title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newIssue.description}
                onChange={(e) =>
                  setNewIssue((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the issue"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Severity</label>
                <Select
                  value={newIssue.severity}
                  onValueChange={(value) =>
                    setNewIssue((prev) => ({ ...prev, severity: value }))
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
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newIssue.status}
                  onValueChange={(value) =>
                    setNewIssue((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="monitoring">Monitoring</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={newIssue.dueDate}
                onChange={(e) =>
                  setNewIssue((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
            <Button onClick={handleCreateIssue} className="w-full">
              Submit Issue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Risks Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Active Risks
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Risk
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Severity
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Owner
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {risks.length > 0 ? (
                  risks.map((risk) => (
                    <tr key={risk._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-medium text-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        {risk.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {risk.projectName || "Unknown Project"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getSeverityColor(risk.severity)}>
                          {risk.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(risk.status)}>
                          {risk.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {risk.ownerName || risk.owner}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No active risks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Issues Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Issues
        </h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Issue
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Severity
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {issue.title}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {issue.projectName || "Unknown Project"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {issue.assigneeName || issue.assignee}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-muted-foreground"
                    >
                      No issues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
