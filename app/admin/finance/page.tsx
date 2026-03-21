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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api-service";
import { buildAuthHeaders } from "@/lib/client-auth";

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
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    amount: 0,
    status: "",
    dueDate: "",
  });
  const [createForm, setCreateForm] = useState({
    invoiceNumber: "",
    amount: 0,
    status: "pending",
    dueDate: "",
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

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditForm({
      amount: invoice.amount,
      status: invoice.status,
      dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
    });
  };

  const handleSaveInvoice = async () => {
    if (!editingInvoice) return;

    try {
      const response = await fetch(`/api/invoices/${editingInvoice._id}`, {
        method: "PUT",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          amount: editForm.amount,
          status: editForm.status,
          dueDate: new Date(editForm.dueDate),
        }),
      });

      if (response.ok) {
        setEditingInvoice(null);
        // Refresh data
        const invoicesData = await apiService.getInvoices();
        setInvoices(invoicesData);
        // Recalculate stats
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
      }
    } catch (error) {
      console.error("Failed to update invoice:", error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!createForm.invoiceNumber.trim()) return;
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: buildAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          invoiceNumber: createForm.invoiceNumber.trim(),
          amount: createForm.amount,
          status: createForm.status,
          dueDate: createForm.dueDate || undefined,
        }),
      });
      if (response.ok) {
        setIsCreateOpen(false);
        setCreateForm({
          invoiceNumber: "",
          amount: 0,
          status: "pending",
          dueDate: "",
        });
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
      }
    } catch (error) {
      console.error("Failed to create invoice:", error);
    }
  };

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

  // Calculate revenue by month from real invoice data
  const revenueByMonth = (() => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Get last 3 months
    const months = [];
    for (let i = 2; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      });
    }

    return months.map(({ month, year, monthIndex }) => {
      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.issuedDate || inv.dueDate);
        return (
          invDate.getMonth() === monthIndex && invDate.getFullYear() === year
        );
      });

      const revenue = monthInvoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.amount, 0);

      const pending = monthInvoices
        .filter((inv) => inv.status === "pending")
        .reduce((sum, inv) => sum + inv.amount, 0);

      return { month, revenue, pending };
    });
  })();

  const getStatusColor = (status: string) => {
    return status === "paid"
      ? "bg-green-500/20 text-green-700"
      : "bg-yellow-500/20 text-yellow-700";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance</h1>
          <p className="text-muted-foreground mt-2">
            Monitor revenue, invoices, and financial metrics
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <FileText className="h-4 w-4" />
          New Invoice
        </Button>
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
                      onClick={() => handleEditInvoice(invoice)}
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-number">Invoice Number</Label>
              <Input
                id="create-number"
                value={createForm.invoiceNumber}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    invoiceNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-amount">Amount</Label>
              <Input
                id="create-amount"
                type="number"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(value) =>
                  setCreateForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="create-dueDate">Due Date</Label>
              <Input
                id="create-dueDate"
                type="date"
                value={createForm.dueDate}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    dueDate: e.target.value,
                  }))
                }
              />
            </div>
            <Button onClick={handleCreateInvoice} className="w-full">
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog
        open={!!editingInvoice}
        onOpenChange={() => setEditingInvoice(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) =>
                  setEditForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={editForm.dueDate}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveInvoice} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditingInvoice(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
