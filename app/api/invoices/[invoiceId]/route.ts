import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess, validateBody, withRBAC } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.object({
  amount: z.number().optional(),
  status: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  paidDate: z.string().or(z.date()).optional(),
});

export const PUT = withRBAC(
  "invoice",
  "update",
  async (request: NextRequest, ctx, user) => {
    try {
      const { invoiceId } = ctx.params as { invoiceId: string };
      const body = validateBody(updateSchema, await request.json());
      const updates = {
        ...body,
        dueDate:
          typeof body.dueDate === "string"
            ? new Date(body.dueDate)
            : body.dueDate,
        paidDate:
          typeof body.paidDate === "string"
            ? new Date(body.paidDate)
            : body.paidDate,
      };

      const updatedInvoice = await db.updateInvoice(invoiceId, updates);

      return apiSuccess(updatedInvoice, "Invoice updated");
    } catch (error) {
      console.error("Failed to update invoice:", error);
      if (
        error instanceof Error &&
        error.message.includes("Validation failed")
      ) {
        return apiError("VALIDATION_ERROR", error.message, 400);
      }
      return apiError("INVOICE_UPDATE_FAILED", "Failed to update invoice", 500);
    }
  }
);
