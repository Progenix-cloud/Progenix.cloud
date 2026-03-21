"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, Download, Eye } from "lucide-react";
import { apiService } from "@/lib/api-service";
import { buildAuthHeaders, getStoredClientId } from "@/lib/client-auth";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
}

export default function InvoicesPage() {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setClientId(user.clientId);
    }
  }, []);

  const { data: invoices = [], isLoading } = useSWR(
    clientId ? ["invoices", clientId, projectId] : null,
    () =>
      apiService.getInvoices({
        clientId: clientId as string,
        projectId: projectId || undefined,
      })
  );

  const { data: projects = [] } = useSWR(
    clientId ? ["projects", clientId] : null,
    () => apiService.getProjects({ clientId: clientId as string })
  );

  // Default to all projects

  const stats = {
    totalAmount: invoices.reduce(
      (sum: number, inv: any) => sum + inv.amount,
      0
    ),
    pendingAmount: invoices
      .filter((inv: any) => inv.status !== "paid")
      .reduce((sum: number, inv: any) => sum + inv.amount, 0),
    paidAmount: invoices
      .filter((inv: any) => inv.status === "paid")
      .reduce((sum: number, inv: any) => sum + inv.amount, 0),
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleDownload = async (invoice: Invoice) => {
    try {
      const res = await fetch(`/api/invoices/${invoice._id}/download`, {
        headers: buildAuthHeaders(),
      });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Invoices & Payments
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage your invoices
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="project-select">Project:</Label>
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                ${stats.totalAmount.toLocaleString()}
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
              <p className="text-sm text-muted-foreground">Paid</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${stats.paidAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                ${stats.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            All Invoices
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-foreground">
                  Invoice #
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
              {invoices.map((invoice: Invoice) => (
                <tr key={invoice._id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    ${invoice.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge
                      className={
                        invoice.status === "paid"
                          ? "bg-green-500/20 text-green-700"
                          : "bg-yellow-500/20 text-yellow-700"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(invoice)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(invoice)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog
        open={isViewOpen}
        onOpenChange={(open) => {
          setIsViewOpen(open);
          if (!open) setSelectedInvoice(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice #</span>
                <span className="font-medium">
                  {selectedInvoice.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  ${selectedInvoice.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={
                    selectedInvoice.status === "paid"
                      ? "bg-green-500/20 text-green-700"
                      : "bg-yellow-500/20 text-yellow-700"
                  }
                >
                  {selectedInvoice.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued</span>
                <span className="font-medium">
                  {new Date(selectedInvoice.issuedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due</span>
                <span className="font-medium">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              {selectedInvoice.paidDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium">
                    {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedInvoice)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No invoice selected.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
