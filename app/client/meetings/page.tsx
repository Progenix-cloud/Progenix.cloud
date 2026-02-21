"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, PlusCircle } from "lucide-react";
import { apiService } from "@/lib/api-service";

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
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    duration: 60,
    description: "",
  });

  useEffect(() => {
    const loadMeetings = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const meetingsData = await apiService.getMeetings({
          clientId: user.clientId,
        });
        setMeetings(meetingsData);
      }
    };
    loadMeetings();
  }, []);

  const handleBookMeeting = async () => {
    if (!formData.title || !formData.date) {
      alert("Please fill in required fields");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      await apiService.createMeeting({
        ...formData,
        date: new Date(formData.date),
        projectId: "proj-001",
        clientId: user.clientId,
        status: "scheduled",
        type: "client-meeting",
        attendees: [],
      });

      setFormData({
        title: "",
        date: "",
        time: "",
        duration: 60,
        description: "",
      });
      setIsOpen(false);

      const meetingsData = await apiService.getMeetings({
        clientId: user.clientId,
      });
      setMeetings(meetingsData);
    }
  };

  const upcomingMeetings = meetings.filter((m) => m.status === "scheduled");
  const pastMeetings = meetings.filter((m) => m.status === "completed");

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

      {/* Upcoming */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Upcoming Meetings
        </h2>
        <div className="space-y-3">
          {upcomingMeetings.length > 0 ? (
            upcomingMeetings.map((meeting) => (
              <Card key={meeting._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {meeting.title}
                    </h3>
                    <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {meeting.time || "TBD"} ({meeting.duration}min)
                      </span>
                    </div>
                  </div>
                  <Button variant="outline">Join Meeting</Button>
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

      {/* Past */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Past Meetings
        </h2>
        <div className="space-y-3">
          {pastMeetings.length > 0 ? (
            pastMeetings.map((meeting) => (
              <Card key={meeting._id} className="p-4 opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {meeting.title}
                    </h3>
                    <div className="flex gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge>Completed</Badge>
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
