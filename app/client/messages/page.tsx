"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { CardSkeleton } from "@/components/loading-skeleton";

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: Date;
}

interface Project {
  _id: string;
  name: string;
}

export default function ClientMessagesPage() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const { data: projects = [], isLoading: projectsLoading } = useSWR(
    clientId ? ["projects", clientId] : null,
    () => apiService.getProjects({ clientId: clientId as string })
  );

  useEffect(() => {
    if (selectedProject === "all") return;
    if (!selectedProject && projects.length > 0) {
      setSelectedProject(projects[0]._id);
    }
  }, [projects, selectedProject]);

  const {
    data: messages = [],
    isLoading: messagesLoading,
    mutate: refreshMessages,
  } = useSWR(
    clientId
      ? ["messages", clientId, selectedProject || "all", projects.length]
      : null,
    async () => {
      if (selectedProject === "all") {
        if (projects.length === 0) return [];
        const results = await Promise.all(
          projects.map((p: Project) =>
            apiService.getMessages({ projectId: p._id })
          )
        );
        const merged = results.flat();
        return merged.sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      }
      if (!selectedProject) return [];
      return apiService.getMessages({ projectId: selectedProject });
    }
  );

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedProject || selectedProject === "all") {
      toast.error("Please select a project to send a message");
      return;
    }
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
      refreshMessages();
      toast.success("Message sent");
    }
  };

  if (projectsLoading) {
    return (
      <div className="p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Communicate with your project team
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h2 className="font-semibold text-foreground mb-4">Projects</h2>
            {projects.length === 0 ? (
              <p className="text-muted-foreground">No projects</p>
            ) : (
              <>
                <Button
                  variant={selectedProject === "all" ? "default" : "outline"}
                  className="w-full justify-start mb-2"
                  onClick={() => setSelectedProject("all")}
                >
                  All Projects
                </Button>
                {projects.map((project: Project) => (
                  <Button
                    key={project._id}
                    variant={
                      selectedProject === project._id ? "default" : "outline"
                    }
                    className="w-full justify-start mb-2"
                    onClick={() => setSelectedProject(project._id)}
                  >
                    {project.name}
                  </Button>
                ))}
              </>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-12 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg: Message) => (
                  <div key={msg._id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback>
                        {msg.senderName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {msg.senderName} ({msg.senderRole})
                      </p>
                      <div className="inline-block px-3 py-2 bg-muted rounded-lg">
                        <p className="text-sm">{msg.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Select a project to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
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
                disabled={!newMessage.trim() || !selectedProject}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                Send
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
