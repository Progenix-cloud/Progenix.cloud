"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CheckCircle, Circle, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/loading-skeleton";
import { apiService } from "@/lib/api-service";
import { cn } from "@/lib/utils";

interface Milestone {
  key: string;
  id?: string;
  projectId: string;
  projectName: string;
  name: string;
  status: string;
  dueDate: string;
  deliverables: string[];
}

interface ProjectGroup {
  projectId: string;
  projectName: string;
  milestones: Milestone[];
}

const buildMilestoneKey = (
  milestone: any,
  projectId: string,
  index: number
) => {
  if (milestone?.id) return milestone.id;
  const due = milestone?.dueDate
    ? new Date(milestone.dueDate).toISOString()
    : "";
  return `${projectId}::${milestone?.name || ""}::${due || index}`;
};

function SortableMilestoneCard({ milestone }: { milestone: Milestone }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: milestone.key });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn("p-6", isDragging && "opacity-70")}
    >
      <div className="flex gap-4">
        <div className="pt-1">
          {milestone.status === "completed" ? (
            <CheckCircle className="h-6 w-6 text-green-600" />
          ) : (
            <Circle className="h-6 w-6 text-accent" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {milestone.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {milestone.projectName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Reorder milestone"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <Badge
                className={
                  milestone.status === "completed"
                    ? "bg-green-500/20 text-green-700"
                    : "bg-accent/20 text-accent"
                }
              >
                {milestone.status}
              </Badge>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Due: {new Date(milestone.dueDate).toLocaleDateString()}
            </p>
            <div className="flex gap-2 flex-wrap">
              {milestone.deliverables.map((d, i) => (
                <Badge key={i} variant="outline">
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function MilestonesPage() {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const authToken = localStorage.getItem("authToken");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
      setToken(authToken);
    }
  }, []);

  const { data: projects, isLoading } = useSWR(
    clientId ? ["projects", clientId] : null,
    () => apiService.getProjects({ clientId: clientId as string })
  );

  useEffect(() => {
    if (!projects) return;
    const nextGroups: ProjectGroup[] = projects
      .map((project: any) => {
        const milestones = (project.milestones || []).map(
          (milestone: any, index: number) => ({
            key: buildMilestoneKey(milestone, project._id, index),
            id: milestone.id,
            projectId: project._id,
            projectName: project.name,
            name: milestone.name,
            status: milestone.status || "pending",
            dueDate: milestone.dueDate,
            deliverables: milestone.deliverables || [],
          })
        );
        return {
          projectId: project._id,
          projectName: project.name,
          milestones,
        } as ProjectGroup;
      })
      .filter((group: ProjectGroup) => group.milestones.length > 0);

    setGroups(nextGroups);
  }, [projects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const persistOrder = async (projectId: string, milestones: Milestone[]) => {
    if (!token) return;
    setIsReordering(true);
    try {
      const response = await fetch("/api/milestones/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          orderedKeys: milestones.map((milestone) => milestone.key),
        }),
      });

      if (!response.ok) {
        toast.error("Failed to save milestone order");
        return;
      }

      toast.success("Milestone order updated");
    } catch (error) {
      console.error("Failed to reorder milestones:", error);
      toast.error("Failed to save milestone order");
    } finally {
      setIsReordering(false);
    }
  };

  const handleDragEnd = (projectId: string, event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setGroups((prev) =>
      prev.map((group) => {
        if (group.projectId !== projectId) return group;
        const oldIndex = group.milestones.findIndex(
          (milestone) => milestone.key === active.id
        );
        const newIndex = group.milestones.findIndex(
          (milestone) => milestone.key === over.id
        );
        const updated = arrayMove(group.milestones, oldIndex, newIndex);
        void persistOrder(projectId, updated);
        return { ...group, milestones: updated };
      })
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <div className="h-8 w-56 bg-muted rounded animate-pulse" />
          <div className="h-4 w-44 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Milestones & Deliverables
          </h1>
          <p className="text-muted-foreground mt-2">
            Track project milestones and deliverables
          </p>
        </div>
        {isReordering && (
          <span className="text-xs text-muted-foreground">Saving order…</span>
        )}
      </div>

      {groups.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No milestones yet</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.projectId} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                {group.projectName}
              </h2>
              <DndContext
                sensors={sensors}
                onDragEnd={(event) => handleDragEnd(group.projectId, event)}
              >
                <SortableContext
                  items={group.milestones.map((milestone) => milestone.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {group.milestones.map((milestone) => (
                      <SortableMilestoneCard
                        key={milestone.key}
                        milestone={milestone}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
