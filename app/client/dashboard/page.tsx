"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { buildAuthHeaders, getStoredClientId } from "@/lib/client-auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
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
  CheckCircle,
  DollarSign,
  Briefcase,
  PlusCircle,
  MessageSquare,
  CreditCard,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { DashboardSkeleton } from "@/components/loading-skeleton";

interface Project {
  _id: string;
  name: string;
  status: string;
  progress: number;
  startDate: Date;
  endDate: Date;
  teamMembers: string[];
  budget?: number;
  spent?: number;
}

interface Meeting {
  _id: string;
  title: string;
  date: Date;
  time: string;
  attendees: string[];
  status: string;
  meetingLink?: string;
}

interface Invoice {
  _id: string;
  amount: number;
  status: string;
  dueDate: Date;
}

export default function ClientDashboard() {
  const [userClientId, setUserClientId] = useState<string | null>(null);
  const [isRequestFeatureOpen, setIsRequestFeatureOpen] = useState(false);
  const [isSubmitFeedbackOpen, setIsSubmitFeedbackOpen] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [newFeatureRequest, setNewFeatureRequest] = useState({
    title: "",
    description: "",
    priority: "medium",
    projectId: "",
  });
  const [newFeedback, setNewFeedback] = useState({
    type: "general",
    subject: "",
    message: "",
    rating: 5,
  });
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    attendees: [] as string[],
    description: "",
  });
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserClientId(user.clientId);
    }
  }, []);

  const {
    data: projects = [],
    isLoading: projectsLoading,
    mutate: refreshProjects,
  } = useSWR(userClientId ? ["projects", userClientId] : null, () =>
    apiService.getProjects({ clientId: userClientId as string })
  );

  const {
    data: meetings = [],
    isLoading: meetingsLoading,
    mutate: refreshMeetings,
  } = useSWR(userClientId ? ["meetings", userClientId] : null, () =>
    apiService.getMeetings({ clientId: userClientId as string })
  );

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    mutate: refreshInvoices,
  } = useSWR(userClientId ? ["invoices", userClientId] : null, () =>
    apiService.getInvoices({ clientId: userClientId as string })
  );

  useEffect(() => {
    if (!userClientId) return;
    const interval = setInterval(() => {
      refreshProjects();
      refreshMeetings();
      refreshInvoices();
    }, 30000);
    return () => clearInterval(interval);
  }, [userClientId, refreshProjects, refreshMeetings, refreshInvoices]);

  // Filter data based on selected project
  const filteredProjects = selectedProjectId
    ? projects.filter((p: any) => p._id === selectedProjectId)
    : projects;

  const filteredMeetings = selectedProjectId
    ? meetings.filter((m: any) => m.projectId === selectedProjectId)
    : meetings;

  const filteredInvoices = selectedProjectId
    ? invoices.filter((i: any) => i.projectId === selectedProjectId)
    : invoices;

  const handleRequestFeature = async () => {
    const clientId = userClientId || getStoredClientId();
    if (!clientId) {
      toast.error("Missing client session");
      return;
    }
    try {
      const primaryProjectId = projects?.[0]?._id;
      const response = await fetch("/api/change-requests", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...newFeatureRequest,
          projectId: newFeatureRequest.projectId || primaryProjectId,
          clientId,
          type: "feature_request",
          status: "pending",
          impact: newFeatureRequest.description,
          estimatedEffort: newFeatureRequest.priority,
        }),
      });

      if (response.ok) {
        setIsRequestFeatureOpen(false);
        setNewFeatureRequest({
          title: "",
          description: "",
          priority: "medium",
          projectId: "",
        });
        toast.success("Feature request submitted");
      } else {
        toast.error("Failed to submit feature request");
      }
    } catch (error) {
      console.error("Failed to submit feature request:", error);
      toast.error("Failed to submit feature request");
    }
  };

  const handleSubmitFeedback = async () => {
    const clientId = userClientId || getStoredClientId();
    if (!clientId) {
      toast.error("Missing client session");
      return;
    }
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...newFeedback,
          category: newFeedback.type,
          clientId,
          submittedAt: new Date(),
        }),
      });

      if (response.ok) {
        setIsSubmitFeedbackOpen(false);
        setNewFeedback({
          type: "general",
          subject: "",
          message: "",
          rating: 5,
        });
        toast.success("Feedback submitted");
      } else {
        toast.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback");
    }
  };

  const handleScheduleMeeting = async () => {
    const clientId = userClientId || getStoredClientId();
    if (!clientId) {
      toast.error("Missing client session");
      return;
    }
    try {
      const primaryProjectId = projects?.[0]?._id;
      if (!primaryProjectId) {
        toast.error("No projects available");
        return;
      }
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          ...newMeeting,
          projectId: primaryProjectId,
          clientId,
          status: "scheduled",
          duration: 60,
        }),
      });

      if (response.ok) {
        setIsScheduleMeetingOpen(false);
        setNewMeeting({
          title: "",
          date: "",
          time: "",
          attendees: [],
          description: "",
        });
        toast.success("Meeting scheduled");
        refreshMeetings();
      } else {
        toast.error("Failed to schedule meeting");
      }
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      toast.error("Failed to schedule meeting");
    }
  };

  const handleCreateProject = async () => {
    const clientId = userClientId || getStoredClientId();
    if (!clientId) {
      toast.error("Missing client session");
      return;
    }
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      setIsCreatingProject(true);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: newProject.name,
          clientId,
          status: "planning",
          progress: 0,
          budget: 0,
          spent: 0,
          description: newProject.description,
        }),
      });

      if (response.ok) {
        setIsCreateProjectOpen(false);
        setNewProject({
          name: "",
          description: "",
        });
        toast.success("Project created successfully");
        refreshProjects();
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };

  const isLoading = projectsLoading || meetingsLoading || invoicesLoading;

  if (isLoading) {
    return (
      <div className="p-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const statusData = [
    {
      name: "Completed",
      value: projects.filter((p: any) => p.status === "completed").length,
      color: "#00d9ff",
    },
    {
      name: "In Progress",
      value: projects.filter((p: any) => p.status === "in-progress").length,
      color: "#b8a0ff",
    },
    {
      name: "Planning",
      value: projects.filter((p: any) => p.status === "planning").length,
      color: "#ffb347",
    },
  ];

  const budgetData = projects.map((project: any) => ({
    name: project.name,
    budget: project.budget || 0,
    spent: project.spent || 0,
  }));

  const totalBudget = projects.reduce(
    (sum: number, p: any) => sum + (p.budget || 0),
    0
  );
  const totalSpent = projects.reduce(
    (sum: number, p: any) => sum + (p.spent || 0),
    0
  );
  const budgetUsage = totalBudget
    ? Math.round((totalSpent / totalBudget) * 100)
    : 0;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of your projects and collaboration
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog
            open={isCreateProjectOpen}
            onOpenChange={setIsCreateProjectOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" variant="default">
                <PlusCircle className="h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Project Name *</Label>
                  <Input
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter project name"
                  />
                </div>
                <div>
                  <Label>Project Description</Label>
                  <Textarea
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter project description (optional)"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCreateProject}
                  disabled={isCreatingProject}
                  className="w-full"
                >
                  {isCreatingProject ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isRequestFeatureOpen}
            onOpenChange={setIsRequestFeatureOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Request Feature
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request New Feature</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Feature Title</Label>
                  <Input
                    value={newFeatureRequest.title}
                    onChange={(e) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter feature title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newFeatureRequest.description}
                    onChange={(e) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the feature"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newFeatureRequest.priority}
                    onValueChange={(value) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleRequestFeature} className="w-full">
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isSubmitFeedbackOpen}
            onOpenChange={setIsSubmitFeedbackOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Feedback
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select
                    value={newFeedback.type}
                    onValueChange={(value) =>
                      setNewFeedback({ ...newFeedback, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={newFeedback.subject}
                    onChange={(e) =>
                      setNewFeedback({
                        ...newFeedback,
                        subject: e.target.value,
                      })
                    }
                    placeholder="Enter subject"
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={newFeedback.message}
                    onChange={(e) =>
                      setNewFeedback({
                        ...newFeedback,
                        message: e.target.value,
                      })
                    }
                    placeholder="Write your feedback"
                  />
                </div>
                <Button onClick={handleSubmitFeedback} className="w-full">
                  Submit Feedback
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isScheduleMeetingOpen}
            onOpenChange={setIsScheduleMeetingOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Meeting</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Meeting Title</Label>
                  <Input
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter meeting title"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newMeeting.description}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        description: e.target.value,
                      })
                    }
                    placeholder="Meeting agenda"
                  />
                </div>
                <Button onClick={handleScheduleMeeting} className="w-full">
                  Schedule
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold">{filteredProjects.length}</p>
            </div>
            <Briefcase className="h-6 w-6 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-2xl font-bold">{budgetUsage}%</p>
            </div>
            <DollarSign className="h-6 w-6 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
              <p className="text-2xl font-bold">{meetings.length}</p>
            </div>
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Invoices</p>
              <p className="text-2xl font-bold">
                {invoices.filter((i: any) => i.status !== "paid").length}
              </p>
            </div>
            <CreditCard className="h-6 w-6 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Project Filter */}
      <Card className="p-4">
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
              {projects.map((project: any) => (
                <SelectItem key={project._id} value={project._id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Status</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budget" fill="#b8a0ff" />
                  <Bar dataKey="spent" fill="#00d9ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {filteredProjects.map((project: any) => (
            <Card key={project._id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{project.name}</h3>
                  <p className="text-muted-foreground">
                    Status: {project.status}
                  </p>
                </div>
                <Badge variant="outline">{project.progress}% Complete</Badge>
              </div>
              <div className="mt-4">
                <Progress value={project.progress} className="h-2" />
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="meetings" className="space-y-6">
          {filteredMeetings.map((meeting: any) => (
            <Card key={meeting._id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                  <p className="text-muted-foreground">
                    {new Date(meeting.date).toLocaleDateString()} at{" "}
                    {meeting.time}
                  </p>
                </div>
                <Badge variant="outline">{meeting.status}</Badge>
              </div>
              {meeting.meetingLink && (
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => window.open(meeting.meetingLink, "_blank")}
                >
                  <CheckCircle className="h-4 w-4" />
                  Join Meeting
                </Button>
              )}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {filteredInvoices.map((invoice: any) => (
            <Card key={invoice._id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Invoice #{invoice._id}
                  </h3>
                  <p className="text-muted-foreground">
                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{invoice.status}</Badge>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-2xl font-bold">${invoice.amount}</p>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
