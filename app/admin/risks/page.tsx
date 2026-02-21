'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, PlusCircle } from 'lucide-react';

export default function RisksPage() {
  const risks = [
    {
      id: '1',
      title: 'Resource Availability',
      project: 'E-Commerce Platform',
      severity: 'high',
      status: 'open',
      dueDate: '2024-04-01',
      owner: 'Sarah Chen',
    },
    {
      id: '2',
      title: 'Third-party API Integration',
      project: 'Mobile App Development',
      severity: 'medium',
      status: 'open',
      dueDate: '2024-03-25',
      owner: 'James Wilson',
    },
    {
      id: '3',
      title: 'Scope Creep',
      project: 'Healthcare Management',
      severity: 'high',
      status: 'in-progress',
      dueDate: '2024-03-20',
      owner: 'Maya Patel',
    },
  ];

  const issues = [
    {
      id: '1',
      title: 'Database Query Performance',
      project: 'E-Commerce Platform',
      severity: 'high',
      status: 'in-progress',
      assignee: 'James Wilson',
      dueDate: '2024-03-22',
    },
    {
      id: '2',
      title: 'Mobile Responsiveness',
      project: 'Mobile App Development',
      severity: 'medium',
      status: 'resolved',
      assignee: 'Emma Rodriguez',
      dueDate: '2024-03-20',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-700';
      case 'high':
        return 'bg-orange-500/20 text-orange-700';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-700';
      default:
        return 'bg-green-500/20 text-green-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/20 text-red-700';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-700';
      case 'resolved':
        return 'bg-green-500/20 text-green-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Risks & Issues</h1>
          <p className="text-muted-foreground mt-2">
            Track project risks and resolve issues
          </p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Report Issue
        </Button>
      </div>

      {/* Risks Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Active Risks</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Risk</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Project</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Severity</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {risks.map((risk) => (
                  <tr key={risk.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium text-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      {risk.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{risk.project}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={getSeverityColor(risk.severity)}>
                        {risk.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={getStatusColor(risk.status)}>
                        {risk.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{risk.owner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Issues Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Issues</h2>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Issue</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Project</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Severity</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{issue.title}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{issue.project}</td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{issue.assignee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
