// Data export and import service
import { db } from "./db";
import { bulkOperationsService } from "./bulk-operations";

export const exportService = {
  // Export all data as JSON
  exportJSON: async (filters?: {
    entities?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<string> => {
    const data: Record<string, any> = {};
    const entities = filters?.entities || [
      "users",
      "clients",
      "projects",
      "tasks",
      "meetings",
      "documents",
      "invoices",
      "feedback",
      "risks",
    ];

    if (entities.includes("users")) {
      data.users = await db.getUsers();
    }
    if (entities.includes("clients")) {
      data.clients = await db.getClients();
    }
    if (entities.includes("projects")) {
      data.projects = await db.getProjects();
    }
    if (entities.includes("tasks")) {
      data.tasks = await db.getTasks();
    }
    if (entities.includes("meetings")) {
      data.meetings = await db.getMeetings();
    }
    if (entities.includes("documents")) {
      data.documents = await db.getDocuments();
    }
    if (entities.includes("invoices")) {
      data.invoices = await db.getInvoices();
    }
    if (entities.includes("feedback")) {
      data.feedback = await db.getFeedback();
    }
    if (entities.includes("risks")) {
      data.risks = await db.getRisks();
    }

    return JSON.stringify(data, null, 2);
  },

  // Export to CSV
  exportCSV: async (entity: string, ids?: string[]): Promise<string> => {
    return bulkOperationsService.exportToCSV(entity, ids || []);
  },

  // Export project report
  exportProjectReport: async (projectId: string): Promise<string> => {
    const project = await db.getProjectById(projectId);
    if (!project) throw new Error("Project not found");

    const tasks = await db.getTasks({ projectId });
    const documents = await db.getDocuments({ projectId });
    const timeLogs = await db.getTimeLogs({ projectId });
    const risks = await db.getRisks({ projectId });

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
    const totalCost = totalHours * 150; // Assuming $150/hour rate

    const report = {
      projectId: project._id,
      projectName: project.name,
      status: project.status,
      startDate: project.startDate,
      endDate: project.endDate,
      progress: `${completedTasks}/${tasks.length} tasks completed`,
      summary: {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks: tasks.length - completedTasks,
        totalHours,
        estimatedCost: totalCost,
        documents: documents.length,
        openRisks: risks.filter((r) => r.status === "open").length,
      },
      tasks: tasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        assignedTo: t.assignedTo,
        dueDate: t.dueDate,
      })),
      documents: documents.map((d) => ({
        title: d.name,
        type: d.type,
        uploadedDate: d.uploadDate,
      })),
      risks: risks.map((r) => ({
        title: r.title,
        severity: r.severity,
        status: r.status,
      })),
    };

    return JSON.stringify(report, null, 2);
  },

  // Export client invoice summary
  exportInvoiceSummary: async (clientId: string): Promise<string> => {
    const client = await db.getClientById(clientId);
    if (!client) throw new Error("Client not found");

    const invoices = await db.getInvoices({ clientId });
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + inv.amount, 0);

    const summary = {
      clientId: client._id,
      clientName: client.name,
      email: client.email,
      invoiceSummary: {
        totalInvoices: invoices.length,
        totalAmount,
        paidAmount,
        pendingAmount: totalAmount - paidAmount,
        paymentRate: ((paidAmount / totalAmount) * 100).toFixed(2) + "%",
      },
      invoices: invoices.map((inv) => ({
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        status: inv.status,
        issuedDate: inv.issuedDate,
        dueDate: inv.dueDate,
        paidDate: inv.paidDate,
      })),
    };

    return JSON.stringify(summary, null, 2);
  },

  // Generate analytics export
  exportAnalytics: async (
    startDate?: Date,
    endDate?: Date
  ): Promise<string> => {
    // Get all data for analytics
    const projects = await db.getProjects();
    const users = await db.getUsers();
    const invoices = await db.getInvoices();
    const timeLogs = await db.getTimeLogs();

    // Calculate stats
    const projectStats = {
      totalProjects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      completedProjects: projects.filter((p) => p.status === "completed")
        .length,
    };

    const teamStats = {
      totalMembers: users.length,
      activeMembers: users.filter((u) => u.role && u.role !== "inactive")
        .length,
    };

    const financeStats = {
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.amount, 0),
      paidRevenue: invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + inv.amount, 0),
      pendingRevenue: invoices
        .filter((inv) => inv.status !== "paid")
        .reduce((sum, inv) => sum + inv.amount, 0),
      totalBillableHours: timeLogs
        .filter((log) => log.billable)
        .reduce((sum, log) => sum + log.hours, 0),
    };

    const analytics = {
      period: {
        startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: endDate || new Date(),
      },
      projectStats,
      teamStats,
      financeStats,
      generatedAt: new Date().toISOString(),
    };

    return JSON.stringify(analytics, null, 2);
  },
};

export type ExportService = typeof exportService;
