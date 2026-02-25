"use client";

import { Card } from "@/components/ui/card";

import { Users, Briefcase, TrendingUp } from "lucide-react";

export default function ResourcesPage() {
  const teamCapacity = [
    { role: "Developer", allocated: 4, available: 2, utilization: "66%" },
    { role: "QA", allocated: 2, available: 1, utilization: "66%" },
    { role: "Designer", allocated: 1, available: 1, utilization: "50%" },
  ];

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
              <p className="text-3xl font-bold text-foreground mt-2">6</p>
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
              <p className="text-3xl font-bold text-foreground mt-2">3</p>
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
              <p className="text-3xl font-bold text-foreground mt-2">61%</p>
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
              {teamCapacity.map((item) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
