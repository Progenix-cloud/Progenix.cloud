"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { CardSkeleton } from "@/components/loading-skeleton";
import { getStoredClientId } from "@/lib/client-auth";

interface Meeting {
  _id: string;
  title: string;
  projectId: string;
  date: Date;
  time: string;
  duration: number;
  status: string;
  attendees: string[];
  description: string;
}

export default function ClientMeetingsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    description: "",
  });
  const [clientId, setClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const {
    data: meetings = [],
    isLoading,
    mutate,
  } = useSWR(clientId ? ["meetings", clientId, selectedProjectId] : null, () =>
    apiService.getMeetings({
      clientId: clientId as string,
      projectId: selectedProjectId || undefined,
    })
  );

  const { data: projects = [] } = useSWR(
    clientId ? ["projects", clientId] : null,
    () => apiService.getProjects({ clientId: clientId as string })
  );

  // Filter meetings based on selected project
  const filteredMeetings = selectedProjectId
    ? meetings.filter((m: any) => m.projectId === selectedProjectId)
    : meetings;

  const handleBookMeeting = async () => {
    if (!formData.title || !formData.date) {
      toast.error("Please fill in required fields");
      return;
    }

    const resolvedClientId = clientId || getStoredClientId();
    if (!resolvedClientId) {
      toast.error("Missing client session");
      return;
    }

    const projectId = projects[0]?._id || null;
    if (!projectId) {
      toast.error("No projects available");
      return;
    }

    try {
      const created = await apiService.createMeeting({
        ...formData,
        date: new Date(formData.date),
        projectId,
        clientId: resolvedClientId,
        status: "scheduled",
        type: "client-meeting",
        attendees: [],
      });

      if (!created) {
        toast.error("Failed to schedule meeting");
        return;
      }

      setFormData({
        title: "",
        date: "",
        time: "",
        duration: 60,
        description: "",
      });
      setIsOpen(false);
      mutate();
      toast.success("Meeting scheduled");
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      toast.error("Failed to schedule meeting");
    }
  };

  const upcomingMeetings = useMemo(
    () => filteredMeetings.filter((m: Meeting) => m.status === "scheduled"),
    [filteredMeetings]
  );
  const pastMeetings = useMemo(
    () => filteredMeetings.filter((m: Meeting) => m.status === "completed"),
    [filteredMeetings]
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Schedule Meetings
          </h1>
          <p className="text-muted-foreground mt-2">
            Book and manage meetings with the team
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Book Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book a Meeting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Meeting Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Project Review"
                  className="mt-1"
                />
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
                      duration: parseInt(e.target.value, 10),
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
                  placeholder="Meeting details and agenda"
                  className="mt-1"
                />
              </div>
              <Button onClick={handleBookMeeting} className="w-full">
                Schedule Meeting
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            {projects.map((project: any) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Upcoming Meetings
        </h2>
        <div className="space-y-3">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting: Meeting) => (
              <Card key={meeting._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">{meeting.status}</Badge>
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

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Past Meetings
        </h2>
        <div className="space-y-3">
          {pastMeetings.length > 0 ? (
            pastMeetings.map((meeting: Meeting) => (
              <Card key={meeting._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {meeting.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline">{meeting.status}</Badge>
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
