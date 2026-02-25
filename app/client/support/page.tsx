"use client";

import { useState } from "react";
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
import { AlertCircle, CheckCircle, Clock, Plus, Search } from "lucide-react";

export default function SupportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const mockTickets = [
    {
      id: "TKT-001",
      title: "Login Issues on Mobile",
      status: "open",
      priority: "high",
      createdDate: "2024-01-20",
      resolvedDate: null,
    },
    {
      id: "TKT-002",
      title: "Feature Request: Dark Mode",
      status: "in-progress",
      priority: "medium",
      createdDate: "2024-01-18",
      resolvedDate: null,
    },
    {
      id: "TKT-003",
      title: "API Integration Error",
      status: "resolved",
      priority: "high",
      createdDate: "2024-01-15",
      resolvedDate: "2024-01-19",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "open":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (
    priority: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    const colors: Record<
      string,
      "default" | "destructive" | "outline" | "secondary"
    > = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    };
    return colors[priority] || "outline";
  };

  const filtered = mockTickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support & Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage all support requests and technical issues
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue in detail so our team can help you quickly.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Issue Title"
                className="w-full px-3 py-2 border rounded"
              />
              <select className="w-full px-3 py-2 border rounded">
                <option>Low Priority</option>
                <option>Medium Priority</option>
                <option>High Priority</option>
              </select>
              <textarea
                placeholder="Detailed Description"
                className="w-full px-3 py-2 border rounded h-24"
              />
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Create Ticket
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filtered.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(ticket.status)}
                    <span className="font-mono text-sm font-semibold text-muted-foreground">
                      {ticket.id}
                    </span>
                    <h3 className="font-semibold">{ticket.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(ticket.createdDate).toLocaleDateString()}
                    {ticket.resolvedDate &&
                      ` • Resolved: ${new Date(ticket.resolvedDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge variant="outline">{ticket.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
