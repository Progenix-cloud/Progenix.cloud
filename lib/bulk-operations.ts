// Bulk operations service for batch processing
import { db } from "./db";

export interface BulkOperation {
  action: "update" | "delete" | "archive" | "export";
  entity: "project" | "task" | "client" | "meeting" | "document" | "invoice";
  ids: string[];
  data?: Record<string, any>;
}

export interface BulkResult {
  success: number;
  failed: number;
  errors: string[];
  results: any[];
}

export const bulkOperationsService = {
  // Execute bulk operations
  execute: async (operation: BulkOperation): Promise<BulkResult> => {
    let result: BulkResult = {
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    try {
      switch (operation.entity) {
        case "project":
          result = await bulkOperationsService.bulkUpdateProjects(
            operation.ids,
            operation.action,
            operation.data
          );
          break;
        case "task":
          result = await bulkOperationsService.bulkUpdateTasks(
            operation.ids,
            operation.action,
            operation.data
          );
          break;
        case "client":
          result = await bulkOperationsService.bulkUpdateClients(
            operation.ids,
            operation.action,
            operation.data
          );
          break;
        case "invoice":
          result = await bulkOperationsService.bulkUpdateInvoices(
            operation.ids,
            operation.action,
            operation.data
          );
          break;
        default:
          result.errors.push(`Unknown entity: ${operation.entity}`);
          result.failed = operation.ids.length;
      }
    } catch (error) {
      result.errors.push(
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return result;
  },

  // Bulk update projects
  bulkUpdateProjects: async (
    ids: string[],
    action: string,
    data?: any
  ): Promise<BulkResult> => {
    let result: BulkResult = {
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    const projects = await db.getProjects();

    for (const id of ids) {
      try {
        const project = projects.find((p) => p._id === id);
        if (!project) {
          result.failed++;
          result.errors.push(`Project ${id} not found`);
          continue;
        }

        switch (action) {
          case "update":
            Object.assign(project, data);
            result.results.push(project);
            result.success++;
            break;
          case "delete":
            // Mark as deleted
            (project as any).deleted = true;
            result.success++;
            break;
          case "archive":
            project.status = "archived" as any;
            result.success++;
            break;
          case "export":
            result.results.push(project);
            result.success++;
            break;
          default:
            result.failed++;
            result.errors.push(`Unknown action: ${action}`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return result;
  },

  // Bulk update tasks
  bulkUpdateTasks: async (
    ids: string[],
    action: string,
    data?: any
  ): Promise<BulkResult> => {
    let result: BulkResult = {
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    const tasks = await db.getTasks();

    for (const id of ids) {
      try {
        const task = tasks.find((t) => t._id === id);
        if (!task) {
          result.failed++;
          result.errors.push(`Task ${id} not found`);
          continue;
        }

        switch (action) {
          case "update":
            Object.assign(task, data);
            result.results.push(task);
            result.success++;
            break;
          case "delete":
            (task as any).deleted = true;
            result.success++;
            break;
          case "export":
            result.results.push(task);
            result.success++;
            break;
          default:
            result.failed++;
            result.errors.push(`Unknown action: ${action}`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return result;
  },

  // Bulk update clients
  bulkUpdateClients: async (
    ids: string[],
    action: string,
    data?: any
  ): Promise<BulkResult> => {
    let result: BulkResult = {
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    const clients = await db.getClients();

    for (const id of ids) {
      try {
        const client = clients.find((c) => c._id === id);
        if (!client) {
          result.failed++;
          result.errors.push(`Client ${id} not found`);
          continue;
        }

        switch (action) {
          case "update":
            Object.assign(client, data);
            result.results.push(client);
            result.success++;
            break;
          case "delete":
            (client as any).deleted = true;
            result.success++;
            break;
          case "export":
            result.results.push(client);
            result.success++;
            break;
          default:
            result.failed++;
            result.errors.push(`Unknown action: ${action}`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return result;
  },

  // Bulk update invoices
  bulkUpdateInvoices: async (
    ids: string[],
    action: string,
    data?: any
  ): Promise<BulkResult> => {
    let result: BulkResult = {
      success: 0,
      failed: 0,
      errors: [],
      results: [],
    };

    const invoices = await db.getInvoices();

    for (const id of ids) {
      try {
        const invoice = invoices.find((i) => i._id === id);
        if (!invoice) {
          result.failed++;
          result.errors.push(`Invoice ${id} not found`);
          continue;
        }

        switch (action) {
          case "update":
            Object.assign(invoice, data);
            result.results.push(invoice);
            result.success++;
            break;
          case "export":
            result.results.push(invoice);
            result.success++;
            break;
          default:
            result.failed++;
            result.errors.push(`Unknown action: ${action}`);
        }
      } catch (error) {
        result.failed++;
        result.errors.push(
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return result;
  },

  // Export to CSV
  exportToCSV: async (entity: string, ids: string[]): Promise<string> => {
    let data: any[] = [];
    let columns: string[] = [];

    if (entity === "project") {
      const projects = await db.getProjects();
      data = projects.filter((p) => ids.includes(p._id));
      columns = [
        "_id",
        "name",
        "description",
        "status",
        "clientId",
        "startDate",
        "endDate",
      ];
    } else if (entity === "task") {
      const tasks = await db.getTasks();
      data = tasks.filter((t) => ids.includes(t._id));
      columns = [
        "_id",
        "title",
        "description",
        "status",
        "priority",
        "projectId",
        "assignedTo",
      ];
    } else if (entity === "invoice") {
      const invoices = await db.getInvoices();
      data = invoices.filter((i) => ids.includes(i._id));
      columns = [
        "_id",
        "invoiceNumber",
        "clientId",
        "amount",
        "status",
        "dueDate",
        "issuedDate",
      ];
    }

    // Convert to CSV format
    const headers = columns.join(",");
    const rows = data.map((item) =>
      columns
        .map((col) => {
          const value = item[col];
          const escapedValue = String(value ?? "").replace(/"/g, '""');
          return `"${escapedValue}"`;
        })
        .join(",")
    );

    return [headers, ...rows].join("\n");
  },
};

export type BulkOperationsService = typeof bulkOperationsService;
