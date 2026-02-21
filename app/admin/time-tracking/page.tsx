"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, PlusCircle } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface TimeLog {
  _id: string;
  projectId: string;
  userId: string;
  taskId: string;
  date: Date;
  hours: number;
  description: string;
  billable: boolean;
}

export default function TimeTrackingPage() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [stats, setStats] = useState({
    totalHours: 0,
    billableHours: 0,
    projects: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const logs = await apiService.getTimeLogs();
      setTimeLogs(logs);

      const totalHours = logs.reduce(
        (sum: number, log: any) => sum + log.hours,
        0
      );
      const billableHours = logs
        .filter((log: any) => log.billable)
        .reduce((sum: number, log: any) => sum + log.hours, 0);

      setStats({
        totalHours,
        billableHours,
        projects: new Set(logs.map((l: any) => l.projectId)).size,
      });
    };
    loadData();
  }, []);

  const getBillableBadgeColor = (billable: boolean) => {
    return billable
      ? "bg-green-500/20 text-green-700"
      : "bg-gray-500/20 text-gray-700";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
          <p className="text-muted-foreground mt-2">
            Monitor team hours and project allocation
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Log Time
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.totalHours}h
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Billable Hours</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.billableHours}h
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Projects Tracked</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.projects}
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <Clock className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      {/* Time Logs Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Time Logs
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Description
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Hours
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Billable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {timeLogs.map((log) => (
                <tr key={log._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {log.projectId}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {log.hours}h
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={getBillableBadgeColor(log.billable)}>
                      {log.billable ? "Billable" : "Non-billable"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
