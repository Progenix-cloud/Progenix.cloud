"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Project {
  _id: string;
  name: string;
  status: string;
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export default function CommunicationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await apiService.getProjects();
        setProjects(projectsData);
        if (projectsData.length > 0 && !selectedProject) {
          setSelectedProject(projectsData[0]._id);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const loadMessages = async () => {
        try {
          const data = await apiService.getMessages({
            projectId: selectedProject,
          });
          setMessages(data);
        } catch (error) {
          console.error("Failed to load messages:", error);
        }
      };
      loadMessages();
    }
  }, [selectedProject]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (user) {
      await apiService.createMessage({
        projectId: selectedProject,
        senderId: user._id,
        senderName: user.name,
        senderRole: user.role,
        message: newMessage,
        type: "text",
      });

      setNewMessage("");

      const data = await apiService.getMessages({ projectId: selectedProject });
      setMessages(data);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Communication</h1>
        <p className="text-muted-foreground mt-2">
          Team collaboration and project discussions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Projects List */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-semibold text-foreground mb-4">Projects</h2>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No projects available
                </p>
              ) : (
                projects.map((project) => (
                  <Button
                    key={project._id}
                    variant={
                      selectedProject === project._id ? "default" : "outline"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedProject(project._id)}
                  >
                    {project.name}
                  </Button>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Messages */}
        <div className="lg:col-span-3">
          <Card className="flex flex-col h-96 md:h-[600px]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex gap-3 ${msg.senderId === localStorage.getItem("user") ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        {getInitials(msg.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 space-y-1 ${msg.senderId === localStorage.getItem("user") ? "text-right" : ""}`}
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {msg.senderName}
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(msg.timestamp).toLocaleTimeString(
                            undefined,
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </p>
                      <div
                        className={`inline-block px-3 py-2 rounded-lg ${
                          msg.senderId === localStorage.getItem("user")
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No messages yet</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-border p-4 space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Send Message
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
