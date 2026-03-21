import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  apiError,
  apiSuccess,
  validateBody,
  validateQuery,
  withRBAC,
} from "@/lib/api-utils";
import { z } from "zod";

const querySchema = z.object({
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  status: z.string().optional(),
});

const createSchema = z
  .object({
    invoiceNumber: z.string().min(1),
    amount: z.number(),
    status: z.string().optional(),
    clientId: z.string().optional(),
    projectId: z.string().optional(),
    dueDate: z.string().optional(),
    issuedDate: z.string().optional(),
  })
  .passthrough();

export const GET = withRBAC(
  "invoice",
  "read",
  async (request: NextRequest, _ctx, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const query = validateQuery(querySchema, searchParams);

      const scopedClientId =
        user.role === "client" ? user.clientId : query.clientId;
      if (user.role === "client" && !user.clientId) {
        return apiSuccess([]);
      }

      const invoices = await db.getInvoices({
        projectId: query.projectId || undefined,
        clientId: scopedClientId || undefined,
        status: query.status || undefined,
      });

      return apiSuccess(invoices);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
      if (error instanceof Error && error.message.includes("Query validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("INVOICES_FETCH_FAILED", "Failed to fetch invoices", 500);
    }
  }
);

export const POST = withRBAC(
  "invoice",
  "create",
  async (request: NextRequest) => {
    try {
      const body = validateBody(createSchema, await request.json());
      const created = await db.createInvoice({
        ...body,
        status: body.status || "pending",
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        issuedDate: body.issuedDate ? new Date(body.issuedDate) : new Date(),
      });
      return apiSuccess(created, "Invoice created");
    } catch (error) {
      console.error("Failed to create invoice:", error);
      if (error instanceof Error && error.message.includes("Validation")) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("INVOICE_CREATE_FAILED", "Failed to create invoice", 500);
    }
  }
);
