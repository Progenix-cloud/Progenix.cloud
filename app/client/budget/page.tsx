"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { apiService } from "@/lib/api-service";
import { CardSkeleton } from "@/components/loading-skeleton";

interface BudgetProject {
  project: string;
  budget: number;
  spent: number;
  remaining: number;
}

export default function BudgetPage() {
  const [clientId, setClientId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const resolvedClientId = clientId;
  const { data: projects = [], isValidating: projectsValidating } = useSWR(
    resolvedClientId ? ["projects", resolvedClientId] : null,
    () => apiService.getProjects({ clientId: resolvedClientId as string })
  );

  const filteredProjects = projectId
    ? projects.filter((p: any) => p._id === projectId)
    : projects;

  const isLoading = !resolvedClientId || projectsValidating;

  const budgetData: BudgetProject[] = useMemo(() => {
    return filteredProjects.map((p: any) => ({
      project: p.name,
      budget: p.budget || 0,
      spent: p.spent || 0,
      remaining: (p.budget || 0) - (p.spent || 0),
    }));
  }, [filteredProjects]);

  const totalBudget = budgetData.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = budgetData.reduce((sum, p) => sum + p.spent, 0);
  const percentUsed =
    budgetData.length > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Budget Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Monitor project spending and budget allocation
        </p>
      </div>

      {/* Project Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Label className="text-sm font-medium">Filter by Project:</Label>
        <Select
          value={projectId || ""}
          onValueChange={(value) => setProjectId(value || null)}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Projects</SelectItem>
            {projects.map((project: any) => (
              <SelectItem key={project._id} value={project._id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${(totalBudget / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                ${(totalSpent / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Budget Used</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {percentUsed}%
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Budget by Project
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="project" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="budget" fill="#b8a0ff" />
              <Bar dataKey="spent" fill="#00d9ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={budgetData.map((p) => ({
                month: p.project.substring(0, 3),
                spent: p.spent,
                budget: p.budget,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spent" stroke="#b8a0ff" />
              <Line type="monotone" dataKey="budget" stroke="#00d9ff" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Budget Breakdown
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
                  Budget
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Spent
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody>
              {budgetData.map((item) => (
                <tr key={item.project} className="border-b border-border">
                  <td className="px-6 py-4 text-sm text-foreground">
                    {item.project}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${item.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${item.spent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${item.remaining.toLocaleString()}
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
