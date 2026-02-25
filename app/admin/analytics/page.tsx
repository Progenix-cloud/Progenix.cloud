"use client";

import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Target, Activity } from "lucide-react";

export default function AnalyticsPage() {
  const projectTrendData = [
    { month: "Jan", completed: 2, inProgress: 1, planning: 1 },
    { month: "Feb", completed: 3, inProgress: 2, planning: 1 },
    { month: "Mar", completed: 3, inProgress: 3, planning: 1 },
  ];

  const taskCompletionData = [
    { week: "W1", completed: 45, pending: 15, overdue: 5 },
    { week: "W2", completed: 52, pending: 18, overdue: 3 },
    { week: "W3", completed: 58, pending: 12, overdue: 2 },
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track project performance and team productivity metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">On-Time Delivery</p>
              <p className="text-3xl font-bold text-foreground mt-2">92%</p>
              <p className="text-xs text-green-600 mt-2">+4% vs last quarter</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Avg Completion Time
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">18 days</p>
              <p className="text-xs text-green-600 mt-2">-2 days improvement</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Adherence</p>
              <p className="text-3xl font-bold text-foreground mt-2">89%</p>
              <p className="text-xs text-yellow-600 mt-2">
                3% under budget avg
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Client Satisfaction
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">4.7/5</p>
              <p className="text-xs text-green-600 mt-2">
                +0.2 pts improvement
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Project Status Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#22c55e" />
              <Bar dataKey="inProgress" fill="#b8a0ff" />
              <Bar dataKey="planning" fill="#00d9ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Task Completion Rate
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={taskCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#22c55e"
                name="Completed"
              />
              <Line type="monotone" dataKey="pending" stroke="#b8a0ff" />
              <Line type="monotone" dataKey="overdue" stroke="#ef4444" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
