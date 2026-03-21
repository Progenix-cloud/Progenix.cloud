"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Users, PlusCircle, Search, UserPlus } from "lucide-react";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { buildAuthHeaders, getStoredClientId } from "@/lib/client-auth";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Project {
  _id: string;
  name: string;
}

interface ClientTeam {
  _id: string;
  name: string;
  projectId: string;
  members: Array<{
    userId: string;
    role?: string;
    name?: string;
    email?: string;
  }>;
}

export default function ClientTeamPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clientTeams, setClientTeams] = useState<ClientTeam[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    projectId: "",
    members: [] as string[],
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
    // Subscribe to realtime team changes via SSE
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
          data.type === "admin-task-assign" ||
          data.type === "project-update"
        ) {
          loadData();
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

  const loadData = async () => {
    try {
      const resolvedClientId = getStoredClientId();
      if (!resolvedClientId) return;
      const [projData, teamData, memberData] = await Promise.all([
        apiService.getProjects({ clientId: resolvedClientId }),
        apiService.getClientTeams({}), // GET /api/client-team
        apiService.getUsers(), // Available users
      ]);
      setProjects(projData);
      setClientTeams(teamData);
      setTeamMembers(
        (memberData || []).filter((m: TeamMember) => m.role !== "client")
      );
    } catch (error) {
      console.error("Failed to load team data:", error);
    }
  };

  const handleCreateTeam = async () => {
    if (
      !formData.name ||
      !formData.projectId ||
      formData.members.length === 0
    ) {
      alert("Please fill all fields and select members");
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      const user = JSON.parse(userStr!);
      const response = await fetch("/api/client-team", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          name: formData.name,
          projectId: formData.projectId,
          members: formData.members,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const team = data?.data || data?.team;
        if (team) {
          setClientTeams([...clientTeams, team]);
        }
        setFormData({ name: "", projectId: "", members: [] });
        setIsOpen(false);
        toast.success("Team created successfully");
      }
    } catch (error) {
      console.error("Failed to create team:", error);
      toast.error("Failed to create team");
    }
  };

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Teams</h1>
          <p className="text-muted-foreground mt-2">
            Manage teams for your projects (syncs to admin)
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Project Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Team Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Marketing Team"
                />
              </div>
              <div>
                <Label>Project</Label>
                <Select
                  value={formData.projectId}
                  onValueChange={(id) =>
                    setFormData({ ...formData, projectId: id })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team Members ({formData.members.length} selected)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border rounded-md p-2 max-h-48 overflow-y-auto">
                  {filteredMembers.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-2 hover:bg-accent rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                          {member.name[0]}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            members: formData.members.includes(member._id)
                              ? formData.members.filter(
                                  (id) => id !== member._id
                                )
                              : [...formData.members, member._id],
                          });
                        }}
                      >
                        {formData.members.includes(member._id)
                          ? "Remove"
                          : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                onClick={handleCreateTeam}
                className="w-full"
                disabled={formData.members.length === 0}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create Team ({formData.members.length} members)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Teams */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Project Teams</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientTeams.map((team) => (
            <Card key={team._id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {team.members.length} members
                    </p>
                    <Badge className="mt-2">
                      {projects.find((p) => p._id === team.projectId)?.name}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Synced to Admin
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
