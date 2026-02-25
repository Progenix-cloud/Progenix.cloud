"use client";

import { useState, useEffect } from "react";
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

export default function ChangeRequestsPage() {
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchChangeRequests = async () => {
      try {
        const res = await fetch("/api/change-requests");
        const data = await res.json();
        setChangeRequests(data.data || []);
      } catch (error) {
        console.error("Failed to fetch change requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChangeRequests();
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const filtered = changeRequests.filter(
    (cr) =>
      (selectedStatus === "all" || cr.status === selectedStatus) &&
      cr.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full px-3 py-2 border rounded"
              />
              <textarea
                placeholder="Description"
                className="w-full px-3 py-2 border rounded h-24"
              />
              <input
                type="text"
                placeholder="Impact Analysis"
                className="w-full px-3 py-2 border rounded"
              />
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Submit
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
            {filtered.map((cr) => (
              <div
                key={cr.id}
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
                      Requested:{" "}
                      {new Date(cr.submittedDate).toLocaleDateString()}
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
