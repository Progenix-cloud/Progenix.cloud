"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { apiService } from "@/lib/api-service";

interface Project {
  _id: string;
  name: string;
  clientId: string;
}

export default function CreateMeetingPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    projectId: "",
    date: "",
    time: "",
    duration: 60,
    description: "",
  });

  useEffect(() => {
    const loadProjects = async () => {
      const data = await apiService.getProjects();
      setProjects(data);
    };
    loadProjects();
  }, []);

  const handleCreateMeeting = async () => {
    if (!formData.title || !formData.projectId || !formData.date) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await apiService.createMeeting({
        ...formData,
        date: new Date(formData.date),
        status: "scheduled",
        type: "meeting",
        attendees: [],
      });

      router.push("/admin/meetings");
    } catch (error) {
      console.error("Failed to create meeting:", error);
      alert("Failed to create meeting");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Meeting</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/meetings")}
        >
          Cancel
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter meeting title"
            />
          </div>

          <div>
            <Label htmlFor="projectId">Project *</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, projectId: value }))
              }
            >
              <SelectTrigger>
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

          <div>
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, date: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, time: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  duration: parseInt(e.target.value) || 60,
                }))
              }
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Meeting description"
              rows={4}
            />
          </div>

          <Button onClick={handleCreateMeeting} className="w-full">
            Create Meeting
          </Button>
        </div>
      </Card>
    </div>
  );
}
