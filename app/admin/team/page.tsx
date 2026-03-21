"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar, X, Search, Filter } from "lucide-react";
import { apiService } from "@/lib/api-service";
import { buildAuthHeaders } from "@/lib/client-auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  avatar?: string;
  joinDate: Date;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [assignMember, setAssignMember] = useState<TeamMember | null>(null);
  const [assignProjectId, setAssignProjectId] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [projects, setProjects] = useState<{ _id: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "developer",
    password: "",
  });
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const loadTeam = async () => {
    try {
      const [users, projectList] = await Promise.all([
        apiService.getUsers(),
        apiService.getProjects(),
      ]);
      const coreMembers = users.filter((u: any) => u.role !== "client");
      setTeamMembers(coreMembers);
      setProjects(projectList || []);
    } catch (error) {
      console.error("Failed to load team members:", error);
    }
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "project_manager":
        return "bg-primary/20 text-primary";
      case "business_head":
        return "bg-accent/20 text-accent";
      case "lead_architect":
        return "bg-secondary/20 text-secondary";
      case "developer":
        return "bg-green-500/20 text-green-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleCreateUser = async () => {
    if (
      !newUser.name.trim() ||
      !newUser.email.trim() ||
      !newUser.password.trim()
    ) {
      toast.error("All fields are required");
      return;
    }
    setCreatingUser(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        setCreateUserOpen(false);
        setNewUser({ name: "", email: "", role: "developer", password: "" });
        loadTeam();
        toast.success("User created successfully");
      } else {
        toast.error("Failed to create user");
      }
    } catch (error) {
      console.error("Failed to create user:", error);
      toast.error("Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignProject = async () => {
    if (!assignMember || !assignProjectId) return;

    setAssigning(true);
    try {
      const res = await fetch(`/api/projects?id=${assignProjectId}`, {
        method: "PUT",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          $addToSet: { teamMembers: assignMember._id },
        }),
      });
      if (res.ok) {
        setAssignOpen(false);
        setAssignMember(null);
        setAssignProjectId("");
        toast.success("Team member assigned to project successfully");
      } else {
        toast.error("Failed to assign team member to project");
      }
    } catch (error) {
      console.error("Failed to assign project:", error);
      toast.error("Failed to assign team member to project");
    } finally {
      setAssigning(false);
    }
  };

  const filteredTeamMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
        <p className="text-muted-foreground mt-2">
          Manage your software development team
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="lead_architect">Lead Architect</SelectItem>
                <SelectItem value="business_head">Business Head</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {filteredTeamMembers.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Developers</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {filteredTeamMembers.filter((m) => m.role === "developer").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Project Managers</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {
              filteredTeamMembers.filter((m) => m.role === "project_manager")
                .length
            }
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Architects</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {
              filteredTeamMembers.filter((m) => m.role === "lead_architect")
                .length
            }
          </p>
        </Card>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeamMembers.map((member) => (
          <Card key={member._id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={member.avatar || "/placeholder.svg"}
                    alt={member.name}
                  />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {member.name}
                  </h3>
                  <Badge className={getRoleBadgeColor(member.role)}>
                    {member.role.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {new Date(member.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setSelectedMember(member);
                    setShowProfileModal(true);
                  }}
                >
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => {
                    setAssignMember(member);
                    setAssignProjectId(projects[0]?._id || "");
                    setAssignOpen(true);
                  }}
                >
                  Assign Project
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Team Member Profile</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedMember.avatar || "/placeholder.svg"}
                    alt={selectedMember.name}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedMember.name}
                  </h3>
                  <Badge className={getRoleBadgeColor(selectedMember.role)}>
                    {selectedMember.role.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMember.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Joined{" "}
                    {new Date(selectedMember.joinDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Assign{" "}
              <span className="font-medium text-foreground">
                {assignMember?.name || "team member"}
              </span>{" "}
              to a project.
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Project
              </label>
              <Select
                value={assignProjectId}
                onValueChange={(value) => setAssignProjectId(value)}
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
            <Button
              className="w-full"
              onClick={handleAssignProject}
              disabled={!assignMember || !assignProjectId || assigning}
            >
              {assigning ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
