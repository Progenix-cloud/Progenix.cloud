"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Briefcase,
  Users,
  PlusCircle,
  MessageSquare,
  FileText,
  CreditCard,
  TrendingUp,
  Download,
} from "lucide-react";
import { apiService } from "@/lib/api-service";

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
}

interface Invoice {
  _id: string;
  amount: number;
  status: string;
  dueDate: Date;
}

export default function ClientDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userClientId, setUserClientId] = useState("");
  const [isRequestFeatureOpen, setIsRequestFeatureOpen] = useState(false);
  const [isSubmitFeedbackOpen, setIsSubmitFeedbackOpen] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [isViewInvoicesOpen, setIsViewInvoicesOpen] = useState(false);
  const [isBudgetTrackingOpen, setIsBudgetTrackingOpen] = useState(false);
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

  const loadData = async () => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserClientId(user.clientId);

      // Load projects for this client
      const projectsData = await apiService.getProjects({
        clientId: user.clientId,
      });
      setProjects(projectsData);

      // Load meetings for this client
      const meetingsData = await apiService.getMeetings({
        clientId: user.clientId,
      });
      setMeetings(meetingsData);

      // Load invoices for this client
      const invoicesData = await apiService.getInvoices({
        clientId: user.clientId,
      });
      setInvoices(invoicesData);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestFeature = async () => {
    try {
      const response = await fetch("/api/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFeatureRequest,
          clientId: userClientId,
          type: "feature_request",
          status: "pending",
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
        alert("Feature request submitted successfully!");
      }
    } catch (error) {
      console.error("Failed to submit feature request:", error);
      alert("Failed to submit feature request. Please try again.");
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFeedback,
          clientId: userClientId,
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
        alert("Feedback submitted successfully!");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };

  const handleScheduleMeeting = async () => {
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newMeeting,
          clientId: userClientId,
          status: "scheduled",
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
        loadData();
        alert("Meeting scheduled successfully!");
      }
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      alert("Failed to schedule meeting. Please try again.");
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert("Failed to download invoice. Please try again.");
    }
  };

  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled");
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
        )
      : 0;

  const progressData = projects.map((p) => ({
    name: p.name.substring(0, 15),
    progress: p.progress || 0,
  }));

  const statusDistribution = [
    {
      name: "In Progress",
      value: projects.filter((p) => p.status === "in-progress").length,
      color: "#b8a0ff",
    },
    {
      name: "Planning",
      value: projects.filter((p) => p.status === "planning").length,
      color: "#00d9ff",
    },
    {
      name: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
      color: "#22c55e",
    },
  ];

  const paymentStatus = [
    {
      name: "Paid",
      value: invoices.filter((i) => i.status === "paid").length,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: invoices.filter((i) => i.status === "pending").length,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Your Project Portal
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your projects, meetings, documents, and budget in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            open={isScheduleMeetingOpen}
            onOpenChange={setIsScheduleMeetingOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Schedule a Meeting</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="meeting-title"
                    value={newMeeting.title}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, title: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="Meeting title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="meeting-date"
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, date: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="meeting-time"
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) =>
                      setNewMeeting({ ...newMeeting, time: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="meeting-description"
                    value={newMeeting.description}
                    onChange={(e) =>
                      setNewMeeting({
                        ...newMeeting,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Meeting agenda and notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsScheduleMeetingOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleScheduleMeeting}>
                  Schedule Meeting
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isViewInvoicesOpen}
            onOpenChange={setIsViewInvoicesOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                View Invoices
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Your Invoices</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {invoices.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No invoices found.
                  </p>
                ) : (
                  invoices.map((invoice) => (
                    <Card key={invoice._id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">
                            Invoice #{invoice._id}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Due:{" "}
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold">
                              ${invoice.amount.toFixed(2)}
                            </p>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice._id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isBudgetTrackingOpen}
            onOpenChange={setIsBudgetTrackingOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Budget Tracking
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Budget Overview</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Budget
                        </p>
                        <p className="text-2xl font-bold">
                          ${totalBudget.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Spent
                        </p>
                        <p className="text-2xl font-bold">
                          ${totalSpent.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">
                    Project Budget Breakdown
                  </h4>
                  {projects.map((project) => (
                    <div key={project._id} className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{project.name}</span>
                        <span>
                          ${project.spent || 0} / ${project.budget || 0}
                        </span>
                      </div>
                      <Progress
                        value={
                          project.budget
                            ? ((project.spent || 0) / project.budget) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isRequestFeatureOpen}
            onOpenChange={setIsRequestFeatureOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Request Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Request New Feature</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feature-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="feature-title"
                    value={newFeatureRequest.title}
                    onChange={(e) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        title: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Feature title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feature-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="feature-description"
                    value={newFeatureRequest.description}
                    onChange={(e) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Detailed description of the feature"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feature-project" className="text-right">
                    Project
                  </Label>
                  <Select
                    value={newFeatureRequest.projectId}
                    onValueChange={(value) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        projectId: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
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
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feature-priority" className="text-right">
                    Priority
                  </Label>
                  <Select
                    value={newFeatureRequest.priority}
                    onValueChange={(value) =>
                      setNewFeatureRequest({
                        ...newFeatureRequest,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRequestFeatureOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleRequestFeature}>Submit Request</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isSubmitFeedbackOpen}
            onOpenChange={setIsSubmitFeedbackOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Submit Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Submit Feedback</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feedback-type" className="text-right">
                    Type
                  </Label>
                  <Select
                    value={newFeedback.type}
                    onValueChange={(value) =>
                      setNewFeedback({ ...newFeedback, type: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feedback-subject" className="text-right">
                    Subject
                  </Label>
                  <Input
                    id="feedback-subject"
                    value={newFeedback.subject}
                    onChange={(e) =>
                      setNewFeedback({
                        ...newFeedback,
                        subject: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Feedback subject"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feedback-message" className="text-right">
                    Message
                  </Label>
                  <Textarea
                    id="feedback-message"
                    value={newFeedback.message}
                    onChange={(e) =>
                      setNewFeedback({
                        ...newFeedback,
                        message: e.target.value,
                      })
                    }
                    className="col-span-3"
                    placeholder="Your feedback message"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="feedback-rating" className="text-right">
                    Rating
                  </Label>
                  <Select
                    value={newFeedback.rating.toString()}
                    onValueChange={(value) =>
                      setNewFeedback({
                        ...newFeedback,
                        rating: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Very Poor</SelectItem>
                      <SelectItem value="2">2 - Poor</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsSubmitFeedbackOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitFeedback}>Submit Feedback</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {projects.length}
              </p>
              <p className="text-xs text-primary mt-2">
                {projects.filter((p) => p.status === "in-progress").length} in
                progress
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Average Progress</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {avgProgress}%
              </p>
              <p className="text-xs text-accent mt-2">Across all projects</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${(totalBudget / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                ${(totalSpent / 1000).toFixed(0)}k spent
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming Meetings</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {upcomingMeetings.length}
              </p>
              <p className="text-xs text-green-600 mt-2">Next week</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Project Progress
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#b8a0ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Project Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Projects & Meetings */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="projects">Your Projects</TabsTrigger>
          <TabsTrigger value="meetings">Upcoming Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                      Project
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                      Progress
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                      Team
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projects.map((project) => (
                    <tr
                      key={project._id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {project.name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          className={
                            project.status === "in-progress"
                              ? "bg-accent/20 text-accent"
                              : project.status === "completed"
                                ? "bg-green-500/20 text-green-700"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${project.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {project.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {project.teamMembers.length} members
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/client/project-status`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="mt-6">
          <div className="space-y-3">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <Card key={meeting._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {meeting.title}
                      </h3>
                      <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          📅 {new Date(meeting.date).toLocaleDateString()}
                        </span>
                        <span>🕐 {meeting.time}</span>
                        <span>👥 {meeting.attendees.length} attendees</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Join
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">
                  No upcoming meetings scheduled
                </p>
                <Link href="/client/meetings">
                  <Button className="mt-4">Book a Meeting</Button>
                </Link>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
