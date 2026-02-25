"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Calendar } from "lucide-react";
import { apiService } from "@/lib/api-service";

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

  useEffect(() => {
    const loadTeam = async () => {
      const members = [
        await apiService.getUserById("admin-001"),
        await apiService.getUserById("admin-002"),
        await apiService.getUserById("admin-003"),
        await apiService.getUserById("admin-004"),
        await apiService.getUserById("admin-005"),
        await apiService.getUserById("admin-006"),
      ].filter(Boolean) as TeamMember[];

      setTeamMembers(members);
    };
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

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
        <p className="text-muted-foreground mt-2">
          Manage your software development team
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Members</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {teamMembers.length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Developers</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {teamMembers.filter((m) => m.role === "developer").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Project Managers</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {teamMembers.filter((m) => m.role === "project_manager").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Architects</p>
          <p className="text-2xl font-bold text-foreground mt-2">
            {teamMembers.filter((m) => m.role === "lead_architect").length}
          </p>
        </Card>
      </div>

      {/* Team Members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
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
                >
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                >
                  Assign Project
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
