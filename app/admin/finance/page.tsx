"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    paidInvoices: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const invoicesData = await apiService.getInvoices();
      setInvoices(invoicesData);

      const totalRevenue = invoicesData.reduce(
        (sum: number, inv: any) => sum + inv.amount,
        0
      );
      const pending = invoicesData.filter(
        (inv: any) => inv.status === "pending"
      );
      const paid = invoicesData.filter((inv: any) => inv.status === "paid");

      setStats({
        totalRevenue,
        pendingPayments: pending.reduce(
          (sum: number, inv: any) => sum + inv.amount,
          0
        ),
        paidInvoices: paid.length,
      });
    };
    loadData();
  }, []);

  const statusDistribution = [
    {
      name: "Paid",
      value: invoices.filter((i) => i.status === "paid").length,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: invoices.filter((i) => i.status === "pending").length,
      color: "#f59e0b",
    },
  ];

  const revenueByMonth = [
    { month: "Jan", revenue: 45000, pending: 15000 },
    { month: "Feb", revenue: 52000, pending: 20000 },
    { month: "Mar", revenue: 48000, pending: 25000 },
  ];

  const getStatusColor = (status: string) => {
    return status === "paid"
      ? "bg-green-500/20 text-green-700"
      : "bg-yellow-500/20 text-yellow-700";
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance</h1>
        <p className="text-muted-foreground mt-2">
          Monitor revenue, invoices, and financial metrics
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${(stats.totalRevenue / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-green-600 mt-2">
                +12% from last month
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${(stats.pendingPayments / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-yellow-600 mt-2">Awaiting payment</p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <TrendingDown className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Paid Invoices</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {stats.paidInvoices}
              </p>
              <p className="text-xs text-green-600 mt-2">On time</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Revenue by Month
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#b8a0ff" />
              <Bar dataKey="pending" fill="#00d9ff" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Invoice Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Invoice
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Due Date
                </th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((invoice) => (
                <tr
                  key={invoice._id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                    >
                      <FileText className="h-3 w-3" />
                      View
                    </Button>
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
