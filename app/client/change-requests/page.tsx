"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckCircle, Clock, AlertCircle, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { CardSkeleton } from "@/components/loading-skeleton";
import { buildAuthHeaders, getStoredClientId } from "@/lib/client-auth";

interface ChangeRequestForm {
  title: string;
  description: string;
  impact: string;
  estimatedEffort: "low" | "medium" | "high";
}

export default function ChangeRequestsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeRequestForm>({
    defaultValues: {
      title: "",
      description: "",
      impact: "",
      estimatedEffort: "medium",
    },
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const { data: changeRequests = [], isLoading, mutate } = useSWR(
    clientId ? ["change-requests", clientId] : null,
    () => apiService.getChangeRequests({ clientId: clientId as string })
  );

  const { data: projects = [] } = useSWR(
    clientId ? ["projects", clientId] : null,
    () => apiService.getProjects({ clientId: clientId as string })
  );

  useEffect(() => {
    if (!projectId && projects.length > 0) {
      setProjectId(projects[0]._id);
    }
  }, [projectId, projects]);

  const filtered = useMemo(() => {
    return changeRequests.filter(
      (cr: any) =>
        (selectedStatus === "all" || cr.status === selectedStatus) &&
        cr.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [changeRequests, selectedStatus, searchTerm]);

  const onSubmit = async (values: ChangeRequestForm) => {
    const resolvedClientId = clientId || getStoredClientId();
    if (!resolvedClientId) {
      toast.error("Missing client session");
      return;
    }
    try {
      const payload = {
        title: values.title,
        description: values.description,
        impact: values.impact,
        estimatedEffort: values.estimatedEffort,
        clientId: resolvedClientId,
        projectId,
        status: "pending",
      };

      const res = await fetch("/api/change-requests", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Change request submitted");
        setIsOpen(false);
        reset();
        mutate();
      } else {
        toast.error("Failed to submit change request");
      }
    } catch (error) {
      console.error("Failed to submit change request:", error);
      toast.error("Failed to submit change request");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-52 bg-muted rounded animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Change Requests</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all change requests for your project
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Change Request</DialogTitle>
              <DialogDescription>
                Submit a new change request for your project. Include detailed
                description and impact analysis.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full px-3 py-2 border rounded"
                  {...register("title", { required: "Title is required" })}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <textarea
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded h-24"
                  {...register("description", {
                    required: "Description is required",
                  })}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Impact Analysis"
                  className="w-full px-3 py-2 border rounded"
                  {...register("impact")}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Effort</label>
                <select
                  className="w-full px-3 py-2 border rounded mt-2"
                  {...register("estimatedEffort")}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search change requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((cr: any) => (
              <div
                key={cr.id || cr._id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(cr.status)}
                    <h3 className="font-semibold">{cr.title}</h3>
                    {getStatusBadge(cr.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {cr.description}
                  </p>
                  <div className="flex gap-6 text-xs text-muted-foreground">
                    <span>Impact: {cr.impact}</span>
                    <span>Effort: {cr.estimatedEffort}</span>
                    <span>
                      Requested: {new Date(cr.submittedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
