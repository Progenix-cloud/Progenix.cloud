"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, TrendingUp, Loader2 } from "lucide-react";
import { buildAuthHeaders } from "@/lib/client-auth";

interface ResourceData {
  totalTeamMembers: number;
  activeProjects: number;
  avgUtilization: number;
  teamCapacity: Array<{
    role: string;
    allocated: number;
    available: number;
    utilization: string;
    utilizationValue: number;
  }>;
}

export default function ResourcesPage() {
  const [data, setData] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources", {
          headers: buildAuthHeaders(),
        });
        if (!response.ok) throw new Error("Failed to fetch resources");
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

    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Resource Planning
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage team capacity and resource allocation
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading resource data...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Resource Planning
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage team capacity and resource allocation
            </p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600 mb-2">Error loading resources</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { totalTeamMembers, activeProjects, avgUtilization, teamCapacity } =
    data;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Resource Planning
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage team capacity and resource allocation
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Team Members
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {totalTeamMembers}
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {activeProjects}
              </p>
            </div>
            <div className="p-3 bg-accent/10 rounded-lg">
              <Briefcase className="h-6 w-6 text-accent" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Utilization</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {avgUtilization}%
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Capacity Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Team Capacity
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Allocated
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Available
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {teamCapacity.length > 0 ? (
                teamCapacity.map((item) => (
                  <tr key={item.role} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {item.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {item.allocated}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {item.available}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{
                              width: item.utilization,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {item.utilization}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No team capacity data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
