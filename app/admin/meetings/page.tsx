"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Users,
  PlusCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Project {
  _id: string;
  name: string;
  clientId: string;
}

interface Meeting {
  _id: string;
  projectId?: string;
  clientId?: string;
  title: string;
  description?: string;
  date?: Date;
  time?: string;
  duration?: number;
  attendees?: string[];
  meetingLink?: string;
  type?: "kickoff" | "review" | "feedback" | "standup" | "other";
  status?: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdDate?: Date;
  updatedDate?: Date;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    date: "",
    time: "",
    duration: 60,
    description: "",
  });

  useEffect(() => {
    loadMeetings();
    loadUsers();
    loadProjects();
  }, []);

  const loadMeetings = async () => {
    const data = await apiService.getMeetings();
    setMeetings(data);
  };

  const loadUsers = async () => {
    try {
      const users = await apiService.getUsers();
      const map: Record<string, any> = {};
      users.forEach((u: any) => {
        map[u._id] = u;
      });
      setUserMap(map);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await apiService.getProjects();
      setProjects(projectsData);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    const token = localStorage.getItem("authToken");
    const url = new URL(
      `/api/notifications/stream?userId=${user._id}`,
      window.location.origin
    );
    if (token) url.searchParams.set("token", token);
    const source = new EventSource(url.toString());
    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (
          data.type === "client-team.create" ||
          data.type === "meeting.booked"
        ) {
          loadMeetings();
        }
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, []);

  const handleCreateMeeting = async () => {
    if (!formData.title || !formData.projectId || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    if (editingId) {
      // Update meeting
      await apiService.updateMeeting(editingId, {
        ...formData,
        date: new Date(formData.date),
        status: "scheduled",
        type: "meeting",
        attendees: [],
      });
      setEditingId(null);
    } else {
      // Create new meeting
      await apiService.createMeeting({
        ...formData,
        date: new Date(formData.date),
        status: "scheduled",
        type: "meeting",
        attendees: [],
      });
    }

    setFormData({
      title: "",
      projectId: "",
      date: "",
      time: "",
      duration: 60,
      description: "",
    });
    setIsOpen(false);

    loadMeetings();
  };

  const handleEdit = (meeting: Meeting) => {
    setFormData({
      title: meeting.title,
      projectId: meeting.projectId || "",
      date: meeting.date
        ? new Date(meeting.date).toISOString().split("T")[0]
        : "",
      time: meeting.time || "",
      duration: meeting.duration || 60,
      description: meeting.description || "",
    });
    setEditingId(meeting._id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this meeting?")) {
      await apiService.deleteMeeting(id);
      loadMeetings();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "scheduled":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400";
    }
  };

  const renderAttendees = (meeting: Meeting) => {
    if (!meeting.attendees || meeting.attendees.length === 0) {
      return "No attendees";
    }
    return meeting.attendees
      .map((id) => userMap[id]?.name || userMap[id]?.email || id)
      .join(", ");
  };

  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled");
  const pastMeetings = meetings.filter((m) => m.status === "completed");

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage project meetings
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  projectId: "",
                  date: "",
                  time: "",
                  duration: 60,
                  description: "",
                });
              }}
            >
              <PlusCircle className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Meeting" : "Schedule Meeting"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Meeting title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Project *</Label>
                <Select
                  value={formData.projectId || undefined}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects
                      .filter(
                        (project) => project._id && project._id.trim() !== ""
                      )
                      .map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Attendees are auto-filled from the client team for this
                  project.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value),
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Meeting description"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleCreateMeeting} className="w-full">
                {editingId ? "Update Meeting" : "Schedule"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Upcoming Meetings
        </h2>
        <div className="space-y-3">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <Card
                key={meeting._id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {meeting.title}
                      </h3>
                      <Badge
                        className={getStatusColor(
                          meeting.status || "scheduled"
                        )}
                      >
                        {meeting.status || "scheduled"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {meeting.date
                          ? new Date(meeting.date).toLocaleDateString()
                          : "TBD"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time || "TBD"} ({meeting.duration} min)
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meeting.attendees?.length || 0} attendees
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Attendees: {renderAttendees(meeting)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(meeting)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(meeting._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No upcoming meetings</p>
            </Card>
          )}
        </div>
      </div>

      {/* Past Meetings */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Past Meetings
        </h2>
        <div className="space-y-3">
          {pastMeetings.length > 0 ? (
            pastMeetings.map((meeting) => (
              <Card
                key={meeting._id}
                className="p-4 opacity-75 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">
                        {meeting.title}
                      </h3>
                      <Badge
                        className={getStatusColor(
                          meeting.status || "scheduled"
                        )}
                      >
                        {meeting.status || "scheduled"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {meeting.date
                          ? new Date(meeting.date).toLocaleDateString()
                          : "TBD"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time} ({meeting.duration} min)
                      </div>
                    </div>
                    {meeting.notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Notes: {meeting.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(meeting)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(meeting._id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No past meetings</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
