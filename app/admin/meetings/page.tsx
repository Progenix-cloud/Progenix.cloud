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
  Calendar,
  Clock,
  Users,
  PlusCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Meeting {
  _id: string;
  title: string;
  projectId: string;
  date: Date;
  time: string;
  duration: number;
  attendees: string[];
  status: string;
  type: string;
  description: string;
  notes?: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    date: "",
    time: "",
    duration: 60,
    description: "",
  });

  useEffect(() => {
    const loadMeetings = async () => {
      const data = await apiService.getMeetings();
      setMeetings(data);
    };
    loadMeetings();
  }, []);

  const handleCreateMeeting = async () => {
    if (!formData.title || !formData.projectId || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    await apiService.createMeeting({
      ...formData,
      date: new Date(formData.date),
      status: "scheduled",
      type: "meeting",
      attendees: [],
    });

    setFormData({
      title: "",
      projectId: "",
      date: "",
      time: "",
      duration: 60,
      description: "",
    });
    setIsOpen(false);

    const data = await apiService.getMeetings();
    setMeetings(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700";
      case "scheduled":
        return "bg-accent/20 text-accent";
      case "cancelled":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
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
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Meeting</DialogTitle>
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
                <Input
                  value={formData.projectId}
                  onChange={(e) =>
                    setFormData({ ...formData, projectId: e.target.value })
                  }
                  placeholder="Project ID"
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
                Schedule
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
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time || "TBD"} ({meeting.duration} min)
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {meeting.attendees.length} attendees
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
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
                      <Badge className={getStatusColor(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString()}
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
