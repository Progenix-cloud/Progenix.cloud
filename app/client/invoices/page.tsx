"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Download, Eye } from "lucide-react";
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

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    paidAmount: 0,
  });

  useEffect(() => {
    const loadInvoices = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        const invoicesData = await apiService.getInvoices({
          clientId: user.clientId,
        });
        setInvoices(invoicesData);

        const totalAmount = invoicesData.reduce(
          (sum: number, inv: any) => sum + inv.amount,
          0
        );
        const paidAmount = invoicesData
          .filter((inv: any) => inv.status === "paid")
          .reduce((sum: number, inv: any) => sum + inv.amount, 0);
        const pendingAmount = totalAmount - paidAmount;

        setStats({ totalAmount, pendingAmount, paidAmount });
      }
    };
    loadInvoices();
  }, []);

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
              {invoices.map((invoice) => (
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
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3" />
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
