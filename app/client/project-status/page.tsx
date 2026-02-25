"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Project {
  _id: string;
  name: string;
  status: string;
  progress: number;
  milestones: any[];
  teamMembers: string[];
}

export default function ProjectStatusPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const projectsData = await apiService.getProjects({
          clientId: user.clientId,
        });
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
        }
      }
    };
    loadProjects();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Project Status</h1>
        <p className="text-muted-foreground mt-2">
          Track detailed progress and milestones for each project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Project List */}
        <div className="lg:col-span-1">
          <Card className="p-4 space-y-2">
            <h2 className="font-semibold text-foreground mb-4">Projects</h2>
            {projects.map((project) => (
              <Button
                key={project._id}
                variant={
                  selectedProject?._id === project._id ? "default" : "outline"
                }
                className="w-full justify-start"
                onClick={() => setSelectedProject(project)}
              >
                <div className="text-left">
                  <p className="text-sm">{project.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {project.progress}%
                  </p>
                </div>
              </Button>
            ))}
          </Card>
        </div>

        {/* Project Details */}
        <div className="lg:col-span-3">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Header */}
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {selectedProject.name}
                      </h2>
                      <Badge className="mt-2 bg-accent/20 text-accent">
                        {selectedProject.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Overall Progress
                    </p>
                    <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${selectedProject.progress || 0}%` }}
                      />
                    </div>
                    <p className="text-sm font-medium text-foreground mt-2">
                      {selectedProject.progress || 0}% Complete
                    </p>
                  </div>
                </div>
              </Card>

              {/* Milestones */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Milestones
                </h3>
                <div className="space-y-4">
                  {selectedProject.milestones &&
                  selectedProject.milestones.length > 0 ? (
                    selectedProject.milestones.map((milestone, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="pt-1">
                          {milestone.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : milestone.status === "in-progress" ? (
                            <Circle className="h-5 w-5 text-accent" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">
                            {milestone.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Due:{" "}
                            {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {milestone.deliverables?.map(
                              (d: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {d}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                        <Badge
                          className={
                            milestone.status === "completed"
                              ? "bg-green-500/20 text-green-700"
                              : milestone.status === "in-progress"
                                ? "bg-accent/20 text-accent"
                                : "bg-muted text-muted-foreground"
                          }
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">
                      No milestones defined
                    </p>
                  )}
                </div>
              </Card>

              {/* Team */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Assigned Team Members
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProject.teamMembers?.map((memberId, idx) => (
                    <div key={idx} className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-foreground">Team Member</p>
                      <p className="text-xs text-muted-foreground">
                        {memberId}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No projects selected</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
