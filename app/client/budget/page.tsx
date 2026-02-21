'use client';

import { Card } from '@/components/ui/card';
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
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function BudgetPage() {
  const budgetData = [
    { project: 'E-Commerce', budget: 50000, spent: 35000, remaining: 15000 },
    { project: 'Mobile App', budget: 75000, spent: 25000, remaining: 50000 },
    { project: 'Analytics', budget: 45000, spent: 0, remaining: 45000 },
    { project: 'Healthcare', budget: 120000, spent: 60000, remaining: 60000 },
  ];

  const spendingTrend = [
    { month: 'Jan', spent: 25000, budget: 30000 },
    { month: 'Feb', spent: 52000, budget: 55000 },
    { month: 'Mar', spent: 48000, budget: 50000 },
  ];

  const totalBudget = budgetData.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = budgetData.reduce((sum, p) => sum + p.spent, 0);
  const percentUsed = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Budget Tracking</h1>
        <p className="text-muted-foreground mt-2">
          Monitor project spending and budget allocation
        </p>
      </div>

      {/* Summary */}
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

      {/* Charts */}
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
            Monthly Spending Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingTrend}>
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

      {/* Project Budget Details */}
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
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Usage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {budgetData.map((project) => (
                <tr key={project.project} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {project.project}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    ${project.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${project.spent.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    ${project.remaining.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{
                            width: `${(project.spent / project.budget) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round((project.spent / project.budget) * 100)}%
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
