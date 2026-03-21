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
import { useEffect, useState } from "react";
import { buildAuthHeaders } from "@/lib/client-auth";

interface AnalyticsData {
  metrics: {
    onTimeDelivery: number;
    avgCompletionTime: number;
    budgetAdherence: number;
    clientSatisfaction: number;
  };
  charts: {
    projectTrendData: Array<{
      month: string;
      completed: number;
      inProgress: number;
      planning: number;
    }>;
    taskCompletionData: Array<{
      week: string;
      completed: number;
      pending: number;
      overdue: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics", {
          headers: buildAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 rounded"></div>
            <div className="h-80 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Analytics
          </h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { metrics, charts } = data;

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
              <p className="text-3xl font-bold text-foreground mt-2">
                {metrics.onTimeDelivery}%
              </p>
              <p className="text-xs text-green-600 mt-2">
                Based on completed projects
              </p>
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
              <p className="text-3xl font-bold text-foreground mt-2">
                {metrics.avgCompletionTime} days
              </p>
              <p className="text-xs text-blue-600 mt-2">
                Project duration average
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Adherence</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {metrics.budgetAdherence}%
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                Projects within budget
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
              <p className="text-3xl font-bold text-foreground mt-2">
                {metrics.clientSatisfaction}/5
              </p>
              <p className="text-xs text-green-600 mt-2">Average rating</p>
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
            <BarChart data={charts.projectTrendData}>
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
            <LineChart data={charts.taskCompletionData}>
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
